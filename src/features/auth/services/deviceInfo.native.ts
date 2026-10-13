import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
const KEY='ttotem_device_identifier_v1';
function randomId():string {return `tt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;}
export async function getDeviceInfo() {
 let id=await SecureStore.getItemAsync(KEY);
 if (!id) {id=randomId(); await SecureStore.setItemAsync(KEY,id);}
 return {deviceIdentifier:id,platform:Platform.OS==='ios'?'IOS':'ANDROID',operatingSystem:Platform.OS,appVersion:'1.0.0',manufacturer:'Unknown',model:'Unknown',pushToken:''};
}
