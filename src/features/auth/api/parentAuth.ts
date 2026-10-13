import { httpRequest } from '@/services/api/http';
import { setRoleSession } from '@/services/auth/session';
import { getDeviceInfo } from '../services/deviceInfo';
import { mobileSchema, otpSchema, parentLoginSchema, normalizeDigits } from '../model/otp';
export async function requestParentOtp(rawMobile:string) {
 const mobile=mobileSchema.parse(normalizeDigits(rawMobile));
 await httpRequest<unknown>('/api/v1/auth/otp/request',{auth:'none',method:'POST',body:{mobile}});
 return mobile;
}
export async function verifyParentOtp(rawMobile:string,rawOtp:string) {
 const mobile=mobileSchema.parse(normalizeDigits(rawMobile));
 const otpCode=otpSchema.parse(normalizeDigits(rawOtp));
 const device=await getDeviceInfo();
 const response=await httpRequest('/api/v1/auth/login',{auth:'none',method:'POST',body:{mobile,otpCode,device}},parentLoginSchema);
 await setRoleSession('parent',response.parentTokens);
 return response;
}
