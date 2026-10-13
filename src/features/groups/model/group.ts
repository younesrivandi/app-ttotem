import { z } from 'zod';
export const groupSchema=z.object({
 name:z.string().optional().nullable(),description:z.string().optional().nullable(),
 address:z.string().optional().nullable(),services:z.array(z.string()).optional().nullable(),
}).passthrough();
export type PublicGroup=z.infer<typeof groupSchema>;
// Join response shape is not asserted: the legacy client ignores its body.
