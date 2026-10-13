/** Web expo-audio may use blob: URLs; resolve them before revoking. */
export async function recordingToDataUrl(uri:string):Promise<string>{
 const response=await fetch(uri);
 if(!response.ok)throw new Error('خواندن فایل صوتی ناموفق بود');
 const blob=await response.blob();
 if(blob.size===0)throw new Error('فایل ضبط‌شده خالی است');
 return await new Promise<string>((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('قالب ضبط معتبر نیست'));
  reader.onerror=()=>reject(new Error('تبدیل فایل صوتی ناموفق بود'));
  reader.readAsDataURL(blob);
 });
}
