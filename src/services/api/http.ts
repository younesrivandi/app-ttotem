import { z } from 'zod';
import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from './config';
import { ApiError, NetworkError } from './errors';
import {
  bootstrapSession, clearRoleSession, currentRevision, currentSession,
  updateRefreshedPair, type Role,
} from '@/services/auth/session';

export type AuthKind = Role | 'none';
export type HttpOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: AuthKind;
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string,string>;
};
export type Schema<T> = { parse: (value: unknown) => T };

const tokenSchema = z.object({ accessToken: z.string().min(1), refreshToken: z.string().nullish() });
type RefreshResult = { token: string; revision: number } | null;
/** A single refresh Promise per auth context doubles as the waiting-request queue. */
const inFlightRefresh: Partial<Record<Role, Promise<RefreshResult>>> = {};

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, upstream?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const relay = () => controller.abort();
  if (upstream?.aborted) controller.abort();
  upstream?.addEventListener('abort', relay, { once: true });
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  catch (error) {
    if (upstream?.aborted) throw error;
    if (controller.signal.aborted) throw new NetworkError('مهلت ارتباط با سرور تمام شد.');
    throw new NetworkError();
  } finally { clearTimeout(timeout); upstream?.removeEventListener('abort', relay); }
}
async function parseResponse(res: Response): Promise<unknown> {
  if (res.status === 204 || res.status === 205 || res.status === 202) return undefined;
  const body = await res.text();
  if (!body) return undefined;
  try { return JSON.parse(body) as unknown; }
  catch { throw new ApiError('پاسخ سرور معتبر نیست.', res.status, 'invalid_json'); }
}
async function failure(res: Response): Promise<ApiError> {
  let message = 'خطایی در ارتباط با سرور رخ داد.';
  try {
    const value: unknown = await res.json();
    if (value && typeof value === 'object') {
      const body = value as Record<string, unknown>;
      if (typeof body.message === 'string') message = body.message;
      else if (typeof body.title === 'string') message = body.title;
    }
  } catch { /* The failure body may not be JSON. */ }
  return new ApiError(message, res.status);
}
function assertCurrent(role: Role, revision: number, token: string): void {
  const pair = currentSession()[role];
  if (currentRevision(role) !== revision || pair?.accessToken !== token)
    throw new ApiError('نشست کاربر تغییر کرده است. درخواست دوباره انجام نشد.', 401, 'session_changed');
}
function waitForRefresh(role: Role, signal?: AbortSignal): Promise<RefreshResult> {
  const task = inFlightRefresh[role];
  if (!task) return Promise.resolve(null);
  if (signal?.aborted) return Promise.reject(new NetworkError('درخواست لغو شد.'));
  if (!signal) return task;
  return new Promise<RefreshResult>((resolve, reject) => {
    const onAbort = () => { signal.removeEventListener('abort', onAbort); reject(new NetworkError('درخواست لغو شد.')); };
    signal.addEventListener('abort', onAbort, { once: true });
    void task.then(
      value => { signal.removeEventListener('abort', onAbort); resolve(value); },
      error => { signal.removeEventListener('abort', onAbort); reject(error); },
    );
  });
}
/** Only the first expired request performs the refresh. Other requests await it. */
function refresh(role: Role, expectedRevision: number): Promise<RefreshResult> {
  const existing = inFlightRefresh[role];
  if (existing) return existing;

  const task: Promise<RefreshResult> = (async () => {
    const original = currentSession()[role];
    if (!original?.refreshToken || currentRevision(role) !== expectedRevision) return null;
    let response: Response;
    try {
      response = await fetchWithTimeout(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: original.refreshToken }),
      }, DEFAULT_TIMEOUT_MS);
    } catch {
      // Network uncertainty must not log out a user or trigger a refresh storm.
      return null;
    }
    if (!response.ok) {
      // Explicit credential rejection invalidates only this role. A 5xx/429 does not.
      if ([400, 401, 403].includes(response.status) && currentRevision(role) === expectedRevision)
        await clearRoleSession(role);
      return null;
    }
    try {
      const pair = tokenSchema.parse(await parseResponse(response));
      if (!await updateRefreshedPair(role, pair, expectedRevision)) return null;
      return { token: pair.accessToken, revision: expectedRevision };
    } catch { return null; }
  })();
  inFlightRefresh[role] = task;
  const cleanup = () => { if (inFlightRefresh[role] === task) delete inFlightRefresh[role]; };
  void task.then(cleanup, cleanup);
  return task;
}

export async function httpRequest<T>(path: string, opts: HttpOptions = {}, schema?: Schema<T>): Promise<T> {
  await bootstrapSession();
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('API path must be relative and start with one slash');
  const role = opts.auth ?? 'child';
  if (opts.signal?.aborted) throw new NetworkError('درخواست لغو شد.');

  // Do not let new requests leave with an obsolete token while refresh is running.
  if (role !== 'none') await waitForRefresh(role, opts.signal);
  const revision = role === 'none' ? null : currentRevision(role);
  const initialToken = role === 'none' ? undefined : currentSession()[role]?.accessToken;
  if (role !== 'none' && !initialToken) throw new ApiError('نشست معتبر نیست. دوباره وارد شوید.', 401, 'unauthorized');

  const send = async (token?: string) => {
    const headers = { ...opts.headers };
    // Never allow a caller-provided Authorization to override refreshed credentials.
    for (const key of Object.keys(headers)) if (key.toLowerCase() === 'authorization') delete headers[key];
    return fetchWithTimeout(`${API_BASE_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
    }, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS, opts.signal);
  };

  let response = await send(initialToken);
  if (response.status === 401 && role !== 'none' && revision !== null && initialToken) {
    // Never replay a response after logout, role switch or child switch.
    if (currentRevision(role) !== revision)
      throw new ApiError('نشست کاربر تغییر کرده است.', 401, 'session_changed');

    // Another call may already have completed refresh while this request was in flight.
    let token = currentSession()[role]?.accessToken;
    if (!token || token === initialToken) {
      const pending = await waitForRefresh(role, opts.signal);
      if (currentRevision(role) !== revision)
        throw new ApiError('نشست کاربر تغییر کرده است.', 401, 'session_changed');
      token = pending?.token ?? currentSession()[role]?.accessToken;
      if (!token || token === initialToken) {
        const updated = await refresh(role, revision);
        token = updated?.token;
      }
    }
    if (!token) throw new ApiError('امکان تمدید نشست وجود ندارد. دوباره تلاش کنید.', 401, 'refresh_failed');
    assertCurrent(role, revision, token);
    response = await send(token); // At most one replay, including for POST attempts.
    assertCurrent(role, revision, token);
  }
  if (!response.ok) throw await failure(response);
  const payload = await parseResponse(response);
  return schema ? schema.parse(payload) : payload as T;
}
