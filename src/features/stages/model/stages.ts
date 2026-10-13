import { z } from 'zod';
const identifier=z.union([z.string(),z.number()]).transform(String);
export const progressSchema=z.object({status:z.string().nullish(),stars:z.coerce.number().nullish(),score:z.coerce.number().nullish(),allowResume:z.boolean().nullish()}).passthrough();
export const stageSchema=z.object({stageId:identifier,title:z.string().nullish(),order:z.number().nullish(),isLocked:z.boolean().nullish(),thumbnailUrl:z.string().nullish(),imageUrl:z.string().nullish(),iconUrl:z.string().nullish(),progress:progressSchema.nullish()}).passthrough();
export const stagesResponseSchema=z.object({stages:z.array(stageSchema),journeyName:z.string().nullish(),backgroundUrl:z.string().nullish(),journeyBackgroundUrl:z.string().nullish()}).passthrough();
export type Stage=z.infer<typeof stageSchema>;
export function completed(stage:Stage){return stage.progress?.status?.toLowerCase()==='completed';}
export function isStageLocked(stage:Stage,index:number,stages:Stage[]){if(typeof stage.isLocked==='boolean')return stage.isLocked;return !completed(stage) && index>0 && !completed(stages[index-1]!);}
export function stageStars(stage:Stage){return Math.max(0,Math.min(5,Number(stage.progress?.stars??0)));}
