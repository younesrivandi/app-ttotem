import { z } from 'zod';
const identifier=z.union([z.string(),z.number()]).transform(String);
export const progressSchema=z.object({status:z.string().nullish(),stars:z.coerce.number().nullish(),score:z.coerce.number().nullish(),allowResume:z.boolean().nullish()}).passthrough();
export const stageSchema=z.object({stageId:identifier,title:z.string().nullish(),order:z.number().nullish(),type:z.string().nullish(),isLocked:z.boolean().nullish(),thumbnailUrl:z.string().nullish(),imageUrl:z.string().nullish(),iconUrl:z.string().nullish(),progress:progressSchema.nullish()}).passthrough();
export const stagesResponseSchema=z.object({stages:z.array(stageSchema),journeyName:z.string().nullish(),backgroundUrl:z.string().nullish(),journeyBackgroundUrl:z.string().nullish()}).passthrough();
export type Stage=z.infer<typeof stageSchema>;
export function completed(stage:Stage){return stage.progress?.status?.toLowerCase()==='completed';}
/**
 * Stage access must come from server-provided progress, never a temporary
 * in-memory Story run. Previously reached stages remain available on return.
 */
export function isStageLocked(stage:Stage,index:number,stages:readonly Stage[]):boolean{
 if(index===0)return false;
 const normalizedStatus=stage.progress?.status?.trim().toLowerCase().replace(/[^a-z]/g,'');
 const hasProgress=normalizedStatus==='completed'||normalizedStatus==='inprogress'
  ||normalizedStatus==='started'||normalizedStatus==='ongoing'
  ||stage.progress?.allowResume===true;
 // Completion/resume and completed predecessor are stronger evidence than a
 // possibly stale isLocked flag in the same response.
 if(hasProgress||completed(stage)||completed(stages[index-1]!))return false;
 if(stage.isLocked===false)return false;
 return true;
}
export function stageStars(stage:Stage){return Math.max(0,Math.min(5,Number(stage.progress?.stars??0)));}

/** Story stages follow the same persistent backend progression as other stages. */
export function isJourneyStageLocked(stage:Stage,index:number,stages:readonly Stage[]):boolean{
 return isStageLocked(stage,index,stages);
}
