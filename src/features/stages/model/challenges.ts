import { z } from 'zod';
const identifier=z.union([z.string(),z.number()]).transform(String);
export const challengeSchema=z.object({challengeId:identifier,title:z.string().nullish(),kind:z.string().nullish(),order:z.number().nullish(),isCompleted:z.boolean().nullish(),hasProgress:z.boolean().nullish(),allowResume:z.boolean().nullish(),standardTime:z.number().nullish(),baseScore:z.number().nullish()}).passthrough();
export const challengesResponseSchema=z.object({challenges:z.array(challengeSchema),nextChallengeId:identifier.nullish(),completedCount:z.number().nullish(),totalCount:z.number().nullish(),stageTitle:z.string().nullish(),title:z.string().nullish(),journeyId:identifier.nullish(),stage:z.object({title:z.string().nullish()}).passthrough().nullish()}).passthrough();
export type Challenge=z.infer<typeof challengeSchema>;
export function challengeDone(c:Challenge){return c.isCompleted===true || (c.hasProgress===true && c.allowResume!==true);}
export function nextChallengeId(challenges:Challenge[],suggested?:string|null){if(suggested)return suggested;return challenges.find(c=>c.allowResume)?.challengeId ?? challenges.find(c=>!c.isCompleted&&!c.hasProgress)?.challengeId;}
export function challengeLocked(challenge:Challenge,index:number,sorted:Challenge[],nextId?:string){return !challengeDone(challenge)&& index>0 && !challengeDone(sorted[index-1]!)&&challenge.challengeId!==nextId;}
export function kindLabel(kind?:string|null){return ({Path:'تمرین مسیر',Choice:'انتخاب پاسخ',Sorting:'مرتب‌سازی',Matching:'جفت‌کردن'} as Record<string,string>)[kind??''] ?? 'بازی آموزشی';}
export function kindIcon(kind?:string|null){return ({Path:'✏️',Choice:'🎯',Sorting:'🧩',Matching:'🪄'} as Record<string,string>)[kind??''] ?? '⭐';}
