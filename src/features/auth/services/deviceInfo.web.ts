const KEY='ttotem-device-id';
function randomId():string {return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;}
export async function getDeviceInfo() {
 let id:string|null=null;
 try {id=window.localStorage.getItem(KEY);if(!id){id=randomId();window.localStorage.setItem(KEY,id);}} catch {id=randomId();}
 return {deviceIdentifier:id,platform:'PWA',operatingSystem:typeof navigator==='undefined'?'Web':navigator.userAgent.slice(0,240),appVersion:'1.0.0',manufacturer:'Browser',model:'Web',pushToken:''};
}
