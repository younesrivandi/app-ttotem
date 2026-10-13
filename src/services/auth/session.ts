import { loadCredentials, saveCredentials } from '@/services/storage/credentialStore';
export type Role = 'parent' | 'child';
export type TokenPair = { accessToken: string; refreshToken?: string | null };
export type AuthSession = { parent?: TokenPair; child?: TokenPair; childId?: string };
type Subscriber = () => void;
const listeners = new Set<Subscriber>();
let state: AuthSession = {};
let bootPromise: Promise<void> | null = null;
let revision = { parent: 0, child: 0 };
function emit() { listeners.forEach(listener => listener()); }
function valid(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return (['parent','child'] as const).every(role => obj[role] === undefined || (typeof obj[role] === 'object' && obj[role] !== null && typeof (obj[role] as Record<string,unknown>).accessToken === 'string'));
}
async function persist() { await saveCredentials(Object.keys(state).length ? JSON.stringify(state) : null); }
export function currentSession(): Readonly<AuthSession> { return state; }
export function currentRevision(role: Role) { return revision[role]; }
export function subscribeSession(listener: Subscriber) { listeners.add(listener); return () => {listeners.delete(listener);}; }
export function bootstrapSession(): Promise<void> {
  if (!bootPromise) bootPromise = (async () => {
    try { const saved = await loadCredentials(); const parsed: unknown = saved ? JSON.parse(saved) : {}; state = valid(parsed) ? parsed : {}; }
    catch { state = {}; }
    emit();
  })();
  return bootPromise;
}
export async function setRoleSession(role: Role, pair: TokenPair, childId?: string) {
  await bootstrapSession();
  revision[role]++;
  state = role === 'parent' ? { ...state, parent: pair } : { ...state, child: pair, childId };
  emit(); await persist();
}
export async function clearRoleSession(role: Role) {
  await bootstrapSession(); revision[role]++;
  if (role === 'parent') {revision.child++; state = {};}
  else { const { child: _child, childId: _childId, ...other } = state; state = other; }
  emit(); await persist();
}
export async function updateRefreshedPair(role: Role, pair: TokenPair, expectedRevision: number): Promise<boolean> {
  if (revision[role] !== expectedRevision) return false;
  const old = state[role]; if (!old) return false;
  state = { ...state, [role]: { accessToken: pair.accessToken, refreshToken: pair.refreshToken ?? old.refreshToken } };
  emit(); await persist(); return true;
}
