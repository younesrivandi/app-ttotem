import { z } from 'zod';
const identifier=z.union([z.string(),z.number()]).transform(String);
export const progressSchema=z.object({status:z.string().nullish(),stars:z.coerce.number().nullish(),score:z.coerce.number().nullish(),allowResume:z.boolean().nullish()}).passthrough();
export const stageSchema=z.object({stageId:identifier,title:z.string().nullish(),order:z.number().nullish(),type:z.string().nullish(),isLocked:z.boolean().nullish(),thumbnailUrl:z.string().nullish(),imageUrl:z.string().nullish(),iconUrl:z.string().nullish(),progress:progressSchema.nullish()}).passthrough();
export const stagesResponseSchema=z.object({stages:z.array(stageSchema),journeyName:z.string().nullish(),backgroundUrl:z.string().nullish(),journeyBackgroundUrl:z.string().nullish()}).passthrough();
export type Stage=z.infer<typeof stageSchema>;
export function completed(stage:Stage){return stage.progress?.status?.toLowerCase()==='completed';}
export function isStageLocked(stage:Stage,index:number,stages:Stage[]){if(typeof stage.isLocked==='boolean')return stage.isLocked;return !completed(stage) && index>0 && !completed(stages[index-1]!);}
export function stageStars(stage:Stage){return Math.max(0,Math.min(5,Number(stage.progress?.stars??0)));}

/** Story progression is one continuous client run, rather than permanently unlocked completed stages. */
const storyRuns = new Map<string,Set<string>>();
const runKey=(childId:string,journeyId:string)=>childId+':'+journeyId;
export function resetStoryRun(childId:string,journeyId:string){
 storyRuns.delete(runKey(childId,journeyId));
}
export function storyRunCompleted(childId:string,journeyId:string,stageId:string){
 const key=runKey(childId,journeyId);
 const set=storyRuns.get(key)??new Set<string>();
 set.add(stageId);storyRuns.set(key,set);
}
export function storyRunHasCompleted(childId:string,journeyId:string,stageId:string){
 return storyRuns.get(runKey(childId,journeyId))?.has(stageId)??false;
}
export function isJourneyStageLocked(stage:Stage,index:number,stages:Stage[],childId:string,journeyId:string){
 if(stage.type?.toLowerCase()!=='story')return isStageLocked(stage,index,stages);
 // A new Story run begins at the first stage even when the server retains historical progress.
 if(index===0)return false;
 const previous=stages[index-1];
 return !previous||!storyRunHasCompleted(childId,journeyId,previous.stageId);
}
