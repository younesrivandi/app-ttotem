const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
export const API_BASE_URL = (configured || 'https://api.ttotem.ir').replace(/\/$/, '');
export const DEFAULT_TIMEOUT_MS = 15000;
