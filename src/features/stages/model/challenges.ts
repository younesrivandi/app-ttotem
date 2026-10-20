import { z } from 'zod';
const identifier=z.union([z.string(),z.number()]).transform(String);
export const challengeSchema=z.object({challengeId:identifier,title:z.string().nullish(),kind:z.string().nullish(),order:z.number().nullish(),isCompleted:z.boolean().nullish(),hasProgress:z.boolean().nullish(),allowResume:z.boolean().nullish(),standardTime:z.number().nullish(),baseScore:z.number().nullish()}).passthrough();
export const challengesResponseSchema=z.object({challenges:z.array(challengeSchema),nextChallengeId:identifier.nullish(),completedCount:z.number().nullish(),totalCount:z.number().nullish(),stageTitle:z.string().nullish(),title:z.string().nullish(),journeyId:identifier.nullish(),stage:z.object({title:z.string().nullish()}).passthrough().nullish()}).passthrough();
export type Challenge=z.infer<typeof challengeSchema>;
export function challengeDone(c:Challenge){return c.isCompleted===true || (c.hasProgress===true && c.allowResume!==true);}
export function nextChallengeId(challenges:Challenge[],suggested?:string|null){if(suggested)return suggested;return challenges.find(c=>c.allowResume)?.challengeId ?? challenges.find(c=>!c.isCompleted&&!c.hasProgress)?.challengeId;}
/** A reached challenge remains replayable even if per-item flags are stale. */
export function challengeLocked(
 challenge:Challenge,index:number,sorted:readonly Challenge[],nextId?:string,
 completedCount=0,stageComplete=false,
){
 if(index===0||stageComplete||challengeDone(challenge)||challenge.allowResume===true)return false;
 const nextIndex=nextId?sorted.findIndex(item=>item.challengeId===nextId):-1;
 if(nextIndex>=0&&index<=nextIndex)return false;
 if(Number.isFinite(completedCount)&&index<=Math.max(0,completedCount))return false;
 if(sorted.slice(index+1).some(challengeDone))return false;
 return !challengeDone(sorted[index-1]!);
}
export function kindLabel(kind?:string|null){return ({Path:'تمرین مسیر',Choice:'انتخاب پاسخ',Sorting:'مرتب‌سازی',Matching:'جفت‌کردن'} as Record<string,string>)[kind??''] ?? 'بازی آموزشی';}
export function kindIcon(kind?:string|null){return ({Path:'✏️',Choice:'🎯',Sorting:'🧩',Matching:'🪄'} as Record<string,string>)[kind??''] ?? '⭐';}
