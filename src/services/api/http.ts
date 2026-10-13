import { z } from 'zod';
import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from './config';
import { ApiError, NetworkError } from './errors';
import { bootstrapSession, clearRoleSession, currentRevision, currentSession, updateRefreshedPair, type Role } from '@/services/auth/session';
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
const refreshes: Partial<Record<Role, Promise<string | null>>> = {};
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, upstream?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const relay = () => controller.abort();
  if (upstream?.aborted) controller.abort();
  upstream?.addEventListener('abort', relay, {once:true});
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal:controller.signal }); }
  catch (error) {
    if (upstream?.aborted) throw error;
    if (controller.signal.aborted) throw new NetworkError('مهلت ارتباط با سرور تمام شد.');
    throw new NetworkError();
  } finally { clearTimeout(timeout); upstream?.removeEventListener('abort',relay); }
}
async function parseResponse(res: Response): Promise<unknown> {
  if (res.status===204 || res.status===205 || res.status===202) return undefined;
  const text = await res.text(); if (!text) return undefined;
  try { return JSON.parse(text) as unknown; } catch { throw new ApiError('پاسخ سرور معتبر نیست.',res.status,'invalid_json'); }
}
async function failure(res:Response): Promise<ApiError> {
  let message = 'خطایی در ارتباط با سرور رخ داد.';
  try { const data:unknown = await res.json(); if (data && typeof data==='object') {
    const body=data as Record<string,unknown>;
    if (typeof body.message==='string') message=body.message;
    else if (typeof body.title==='string') message=body.title;
  }} catch { /* HTTP response may be non-JSON */ }
  return new ApiError(message,res.status);
}
async function refresh(role: Role): Promise<string | null> {
  if (refreshes[role]) return refreshes[role];
  const task = (async () => {
    const old = currentSession()[role]; if (!old?.refreshToken) return null;
    const snapshot = currentRevision(role);
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({refreshToken:old.refreshToken})
      }, DEFAULT_TIMEOUT_MS);
      if (!response.ok) { if (currentRevision(role)===snapshot) await clearRoleSession(role); return null; }
      const pair = tokenSchema.parse(await parseResponse(response));
      const updated=await updateRefreshedPair(role,pair,snapshot);
      return updated ? pair.accessToken : null;
    } catch {
      // An indeterminate network failure must NOT erase potentially valid credentials.
      return null;
    }
  })();
  refreshes[role]=task;
  try {return await task;} finally {delete refreshes[role];}
}
export async function httpRequest<T>(path:string, opts:HttpOptions={}, schema?:Schema<T>):Promise<T> {
  await bootstrapSession();
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('API path must be relative and start with one slash');
  const role=opts.auth??'child';
  const send = async (token?:string) => fetchWithTimeout(`${API_BASE_URL}${path}`,{
    method:opts.method??'GET',
    headers:{...(opts.body!==undefined?{'Content-Type':'application/json'}:{}), ...(token?{Authorization:`Bearer ${token}`}:{}) ,...opts.headers},
    ...(opts.body!==undefined ? {body:JSON.stringify(opts.body)}:{}),
  },opts.timeoutMs??DEFAULT_TIMEOUT_MS,opts.signal);
  let response=await send(role==='none'?undefined:currentSession()[role]?.accessToken);
  if (response.status===401 && role!=='none') {
    const newToken=await refresh(role);
    if (newToken) response=await send(newToken); // exactly one retry after refreshing
  }
  if (!response.ok) throw await failure(response);
  const payload=await parseResponse(response);
  return schema ? schema.parse(payload) : payload as T;
}
