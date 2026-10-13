import { z } from 'zod';
// These response schemas are grounded only where the old client specified a concrete shape.
export const tokenPairSchema = z.object({ accessToken:z.string().min(1),refreshToken:z.string().nullish() });
export type TokenPairResponse = z.infer<typeof tokenPairSchema>;
// Other endpoint response structures remain unknown until backend payloads are inspected.
// Callers must narrow unknown at their feature boundary; never silently cast to any.
