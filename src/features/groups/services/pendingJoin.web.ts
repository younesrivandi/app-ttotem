const KEY='ttotem-pending-join';
// Non-sensitive invitation slug only; never store credentials here.
export async function savePendingJoin(slug:string){if(typeof sessionStorage!=='undefined')sessionStorage.setItem(KEY,slug);}
export async function readPendingJoin(){return typeof sessionStorage==='undefined'?null:sessionStorage.getItem(KEY);}
export async function clearPendingJoin(){if(typeof sessionStorage!=='undefined')sessionStorage.removeItem(KEY);}
