// Temporary same-tab web persistence until the backend supports HttpOnly refresh cookies.
// sessionStorage is JavaScript-readable and must not be considered a production-grade
// refresh-token store. Never use localStorage for these tokens.
const KEY = 'ttotem.web.session.v1';
let temporary: string | null = null;

type StoredPair = { accessToken: string; refreshToken?: string };
type StoredSession = { parent?: StoredPair; child?: StoredPair; childId?: string };

function sanitize(value: string): string | null {
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const session = data as Record<string, unknown>;
    const result: StoredSession = {};
    for (const role of ['parent', 'child'] as const) {
      const pair = session[role];
      if (pair && typeof pair === 'object' && !Array.isArray(pair)) {
        const token = pair as Record<string, unknown>;
        if (typeof token.accessToken === 'string' && token.accessToken.length > 0) {
          result[role] = {
            accessToken: token.accessToken,
            ...(typeof token.refreshToken === 'string' && token.refreshToken.length > 0
              ? { refreshToken: token.refreshToken } : {}),
          };
        }
      }
    }
    if (result.child && typeof session.childId === 'string') result.childId = session.childId;
    return result.parent || result.child ? JSON.stringify(result) : null;
  } catch { return null; }
}

export async function loadCredentials(): Promise<string | null> {
  if (temporary !== null) return temporary;
  try {
    const value = window.sessionStorage.getItem(KEY);
    return value ? sanitize(value) : null;
  } catch { return null; }
}

export async function saveCredentials(value: string | null): Promise<void> {
  const safe = value ? sanitize(value) : null;
  temporary = safe;
  try {
    if (safe) window.sessionStorage.setItem(KEY, safe);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    // Session remains available in this tab's memory when storage is blocked.
  }
}
