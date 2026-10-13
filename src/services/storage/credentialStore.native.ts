import * as SecureStore from 'expo-secure-store';
const KEY = 'ttotem_session_v3';
export async function loadCredentials(): Promise<string | null> { return SecureStore.getItemAsync(KEY); }
export async function saveCredentials(value: string | null): Promise<void> {
  if (value === null) await SecureStore.deleteItemAsync(KEY);
  else await SecureStore.setItemAsync(KEY, value);
}
