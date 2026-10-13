import * as FileSystem from 'expo-file-system/legacy';
/** Preserve legacy API contract: answer is a base64 data URL, not a file:// URI. */
export async function recordingToDataUrl(uri:string):Promise<string>{
 const base64=await FileSystem.readAsStringAsync(uri,{encoding:FileSystem.EncodingType.Base64});
 if(!base64)throw new Error('فایل ضبط‌شده خالی است');
 return `data:audio/mp4;base64,${base64}`;
}
