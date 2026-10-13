// Metro resolves .native.ts on Android/iOS, .web.ts on Web.
// This fallback is for non-platform tooling only; never persist credentials here.
let temporary: string | null = null;
export async function loadCredentials(): Promise<string | null> { return temporary; }
export async function saveCredentials(value: string | null): Promise<void> { temporary = value; }
