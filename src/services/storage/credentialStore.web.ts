// No secure JS-readable persistent token storage exists on the open web.
// Until a backend/BFF issues HttpOnly cookies, web credentials are tab-memory only.
let temporary: string | null = null;
export async function loadCredentials(): Promise<string | null> { return temporary; }
export async function saveCredentials(value: string | null): Promise<void> { temporary = value; }
