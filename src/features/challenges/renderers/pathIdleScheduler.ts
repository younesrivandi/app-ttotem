/**
 * Wait for a quiet period after the LAST stroke before validating a Path.
 * Starting another stroke cancels the outstanding submission.
 */
export const PATH_IDLE_DELAY_MS=1800;

export function createPathIdleScheduler(onIdle:()=>void,delayMs=PATH_IDLE_DELAY_MS){
 let pending:ReturnType<typeof setTimeout>|null=null;
 const cancel=()=>{
  if(pending!==null){clearTimeout(pending);pending=null;}
 };
 return {
  schedule(){
   cancel();
   pending=setTimeout(()=>{pending=null;onIdle();},delayMs);
  },
  cancel,
 };
}
