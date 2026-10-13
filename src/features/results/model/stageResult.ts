import { z } from 'zod';
const numeric=z.number().finite();
export const stageResultSchema=z.object({
 progress:z.object({stars:numeric.nullish(),score:numeric.nullish(),attemptCount:numeric.nullish()}).passthrough().nullish(),
 attempts:z.array(z.object({isCorrect:z.boolean().nullish()}).passthrough()).nullish(),
}).passthrough();
export type StageResult=z.infer<typeof stageResultSchema>;
export function resultStats(result:StageResult){return {
 stars:Math.max(0,Math.min(3,Math.trunc(result.progress?.stars??0))),
 score:result.progress?.score??0,
 attemptCount:result.progress?.attemptCount??0,
 correctCount:result.attempts?.filter(a=>a.isCorrect===true).length??0,
};}
