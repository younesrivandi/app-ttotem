// Interim web session continuity: sessionStorage survives a page refresh in the
// same tab. Refresh tokens are NEVER persisted in JavaScript-readable storage.
// This is not equivalent to a secure HttpOnly cookie session and does not
// guarantee login after the access token expires. Replace with a BFF/cookie
// session before production web release.
const KEY = 'ttotem.web.session.v1';
let temporary: string | null = null;

type StoredSession = {
  parent?: { accessToken: string };
  child?: { accessToken: string };
  childId?: string;
};

function accessOnly(value: string): string | null {
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const session = data as Record<string, unknown>;
    const result: StoredSession = {};
    for (const role of ['parent', 'child'] as const) {
      const pair = session[role];
      if (pair && typeof pair === 'object' && !Array.isArray(pair)) {
        const token = (pair as Record<string, unknown>).accessToken;
        if (typeof token === 'string' && token.length > 0) {
          result[role] = { accessToken: token };
        }
      }
    }
    if (result.child && typeof session.childId === 'string') result.childId = session.childId;
    return result.parent || result.child ? JSON.stringify(result) : null;
  } catch {
    return null;
  }
}

export async function loadCredentials(): Promise<string | null> {
  if (temporary !== null) return temporary;
  try {
    const stored = window.sessionStorage.getItem(KEY);
    return stored ? accessOnly(stored) : null;
  } catch {
    return null;
  }
}

export async function saveCredentials(value: string | null): Promise<void> {
  temporary = value;
  try {
    const safe = value ? accessOnly(value) : null;
    if (safe) window.sessionStorage.setItem(KEY, safe);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    // Private browsing / disabled storage: keep current-tab memory session.
  }
}
