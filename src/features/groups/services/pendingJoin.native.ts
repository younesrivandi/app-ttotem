import * as SecureStore from 'expo-secure-store';
const KEY='ttotem-pending-join';
export async function savePendingJoin(slug:string){await SecureStore.setItemAsync(KEY,slug);}
export async function readPendingJoin(){return SecureStore.getItemAsync(KEY);}
export async function clearPendingJoin(){await SecureStore.deleteItemAsync(KEY);}
