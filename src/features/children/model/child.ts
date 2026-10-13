import { z } from 'zod';
import { normalizeDigits } from '@/features/auth/model/otp';
export const childSchema = z.object({
 childProfileId:z.string().min(1),firstName:z.string(),lastName:z.string().default(''),
 birthDate:z.string().optional().nullable(),totalScore:z.number().optional().nullable(),
 totalMedals:z.number().optional().nullable(),age:z.number().optional().nullable(),
 avatarUrl:z.string().optional().nullable(),gender:z.enum(['boy','girl']).optional().nullable(),avatarId:z.string().optional().nullable(),
}).passthrough();
export const childrenSchema=z.array(childSchema);
export type Child=z.infer<typeof childSchema>;
export const createChildSchema=z.object({
 firstName:z.string().trim().min(1,'نام کودک را وارد کنید.'),
 lastName:z.string().trim(),
 nationalCode:z.string().refine(v=>v==='' || /^\d{10}$/.test(v),'کد ملی باید ۱۰ رقم باشد.'),
});
export type CreateChildPayload={firstName:string;lastName:string;birthDate:string;nationalCode:string|null;gender:'boy'|'girl';avatarId:string|null;avatarUrl:string};
export function validateChildForm(firstName:string,lastName:string,nationalCode:string) {
 return createChildSchema.safeParse({firstName,lastName,nationalCode:normalizeDigits(nationalCode)});
}
