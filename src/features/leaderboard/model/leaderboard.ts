import { z } from 'zod';
export const rankingRowSchema=z.object({
 childProfileId:z.string().optional().nullable(),
 rank:z.number().int().positive().optional().nullable(),
 displayName:z.string().optional().nullable(),name:z.string().optional().nullable(),
 score:z.number().optional().nullable(),isCurrentChild:z.boolean().optional().default(false),
}).passthrough();
export const rankingsSchema=z.union([z.array(rankingRowSchema),z.object({
 entries:z.array(rankingRowSchema).optional(),items:z.array(rankingRowSchema).optional(),
}).passthrough()]).transform(data=>Array.isArray(data)?data:(data.entries??data.items??[]));
export type RankingRow=z.infer<typeof rankingRowSchema>;
