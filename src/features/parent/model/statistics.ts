import { z } from 'zod';
// Fields reflect the legacy parent dashboard; unknown extra API fields are preserved.
const finiteNumber = z.number().finite();
export const journeyProgressSchema = z.object({
 journeyId:z.union([z.string(),z.number()]),
 journeyName:z.string().nullish(),
 name:z.string().nullish(),
 progressPercent:finiteNumber.nullish(),
}).passthrough();
export const childStatisticsSchema = z.object({
 totalScore:finiteNumber.nullish(),
 completedStages:finiteNumber.nullish(),
 accuracyPercent:finiteNumber.nullish(),
 totalAttempts:finiteNumber.nullish(),
 learningTimeSeconds:finiteNumber.nullish(),
 journeyProgress:z.array(journeyProgressSchema).nullish(),
}).passthrough();
export type ChildStatistics=z.infer<typeof childStatisticsSchema>;
export type JourneyProgress=z.infer<typeof journeyProgressSchema>;
export function clampPercent(value:number | null | undefined):number {return Math.max(0,Math.min(100,value??0));}
export function formatLearningTime(seconds:number | null | undefined):string {
 const minutes=Math.round(Math.max(0,seconds??0)/60);
 return minutes<60?`${minutes} دقیقه`:`${Math.floor(minutes/60)} س ${minutes%60} د`;
}
