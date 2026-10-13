import { z } from 'zod';
export const normalizeDigits = (value:string):string => value.trim().replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[\s-]/g,'');
export const mobileSchema = z.string().regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.');
export const otpSchema = z.string().regex(/^\d{6}$/, 'کد ورود باید ۶ رقم باشد.');
export const parentLoginSchema = z.object({parentTokens:z.object({accessToken:z.string().min(1),refreshToken:z.string().nullish()})});
export type ParentLoginResponse = z.infer<typeof parentLoginSchema>;
