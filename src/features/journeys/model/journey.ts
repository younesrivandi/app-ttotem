import { z } from 'zod';
export const journeySchema = z.object({
  journeyId: z.union([z.string(),z.number()]).transform(String),
  name: z.string().nullish(),
  thumbnailUrl: z.string().nullish(),
  progressPercent: z.number().finite().nullish(),
  isLatestSelected: z.boolean().nullish(),
  isLocked: z.boolean().nullish(),
}).passthrough();
export const journeyResponseSchema = z.object({ journeys: z.array(journeySchema) }).passthrough();
export type Journey = z.infer<typeof journeySchema>;
export function percent(value:number|null|undefined) {return Math.min(100,Math.max(0,value??0));}
export function earnedStars(value:number|null|undefined) {return Math.round(percent(value)/20);}
