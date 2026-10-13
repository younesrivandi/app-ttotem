// DEVELOPMENT-ONLY persistent web session. localStorage is JavaScript-readable and
// exposes refresh tokens to XSS. Release audit MUST reject this until the backend
// provides a Secure, HttpOnly cookie/BFF refresh flow.
const KEY = 'ttotem.web.session.v2';
const LEGACY_KEY = 'ttotem.web.session.v1';
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
    // Durable storage keeps the same child and parent session when a browser tab closes.
    const saved = window.localStorage.getItem(KEY);
    if (saved) return sanitize(saved);
    // Migrate an existing signed-in tab without requiring another OTP.
    const legacy = window.sessionStorage.getItem(LEGACY_KEY);
    const migrated = legacy ? sanitize(legacy) : null;
    if (migrated) {
      window.localStorage.setItem(KEY, migrated);
      window.sessionStorage.removeItem(LEGACY_KEY);
    }
    return migrated;
  } catch {
    try {
      const legacy = window.sessionStorage.getItem(LEGACY_KEY);
      return legacy ? sanitize(legacy) : null;
    } catch { return null; }
  }
}

export async function saveCredentials(value: string | null): Promise<void> {
  const safe = value ? sanitize(value) : null;
  temporary = safe;
  try {
    if (safe) window.localStorage.setItem(KEY, safe);
    else window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(LEGACY_KEY);
  } catch {
    // Keep same-tab continuity when persistent storage is restricted.
    try {
      if (safe) window.sessionStorage.setItem(LEGACY_KEY, safe);
      else window.sessionStorage.removeItem(LEGACY_KEY);
    } catch { /* Storage may be disabled completely. */ }
  }
}
