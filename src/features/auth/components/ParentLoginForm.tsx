import { useEffect, useRef, useState } from 'react';
import { View, TextInput, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { AppButton, AppInput, AppText } from '@/components/ui';
import { AppSheet, type AppSheetHandle } from '@/components/overlays/AppSheet';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';
import { bootstrapSession, currentSession } from '@/services/auth/session';
import { readPendingJoin } from '@/features/groups/services/pendingJoin';
import { requestParentOtp, verifyParentOtp } from '../api/parentAuth';
import { normalizeDigits, mobileSchema, otpSchema } from '../model/otp';
function errorMessage(e:unknown):string {return e instanceof z.ZodError ? e.issues[0]?.message??'داده ورودی معتبر نیست.' : e instanceof Error?e.message:'ارتباط با سرور برقرار نشد.';}
export function ParentLoginForm() {
 const router=useRouter();const {colors}=useAppTheme();
 const sheet=useRef<AppSheetHandle>(null);
 const [mobile,setMobile]=useState('');const [code,setCode]=useState('');
 const [verifiedMobile,setVerifiedMobile]=useState('');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [otpError,setOtpError]=useState('');
 const [opened,setOpened]=useState(false);
 useEffect(()=>{let active=true;void bootstrapSession().then(()=>{if(active && currentSession().parent?.accessToken){void readPendingJoin().then(slug=>{if(active)router.replace(slug?`/join/${encodeURIComponent(slug)}`:'/children');});}});return ()=>{active=false;};},[router]);
 async function send() {
 if(busy)return;
 const parsed=mobileSchema.safeParse(normalizeDigits(mobile));
 if(!parsed.success){setError(parsed.error.issues[0]?.message??'شماره موبایل نامعتبر است.');return;}
 setBusy(true);setError('');
 try {const normalized=await requestParentOtp(parsed.data);setVerifiedMobile(normalized);setMobile(normalized);setCode('');setOtpError('');setOpened(true);sheet.current?.present();}
 catch(e:unknown){setError(errorMessage(e));}finally{setBusy(false);}
 }
 async function confirm() {
 if(busy)return;
 const parsed=otpSchema.safeParse(normalizeDigits(code));
 if(!parsed.success){setOtpError(parsed.error.issues[0]?.message??'کد نامعتبر است.');return;}
 setBusy(true);setOtpError('');
 try {await verifyParentOtp(verifiedMobile,parsed.data);Keyboard.dismiss();sheet.current?.dismiss();const pending=await readPendingJoin();router.replace(pending?`/join/${encodeURIComponent(pending)}`:'/children');}
 catch(e:unknown){setOtpError(errorMessage(e));}finally{setBusy(false);}
 }
 return <View style={{width:'100%',maxWidth:480,alignSelf:'center',gap:spacing.lg}}>
   <View style={{alignItems:'center',gap:spacing.xs,paddingVertical:spacing.xl}}><AppText variant="hero" weight="700">تی‌توتم</AppText><AppText tone="muted">هر کودک یک دنیا</AppText></View>
   <View style={{backgroundColor:colors.surface,borderRadius:radii.xl,padding:spacing.lg,gap:spacing.md,borderWidth:1,borderColor:colors.border}}>
    <AppText variant="title" weight="700">ورود والد</AppText>
    <AppInput label="شماره موبایل" required keyboardType="phone-pad" textContentType="telephoneNumber" value={mobile} onChangeText={v=>{setMobile(v);setError('');}} placeholder="۰۹xxxxxxxxx" maxLength={18} error={error} onSubmitEditing={()=>{void send();}} />
    <AppButton title="دریافت کد ورود" fullWidth loading={busy} onPress={()=>{void send();}} />
    <AppText variant="caption" tone="muted">با ادامه، شرایط و قوانین استفاده از تی‌توتم را می‌پذیرید.</AppText>
   </View>
   <AppSheet ref={sheet} snapPoints={['65%','90%']} onDismiss={()=>{setOpened(false);setOtpError('');}}>
    <View style={{gap:spacing.md,paddingBottom:spacing.lg}}>
     <AppText variant="subtitle" weight="700">کد ورود را وارد کنید</AppText>
     <AppText tone="muted">کد ۶ رقمی ارسال‌شده به {verifiedMobile}</AppText>
     <AppInput label="کد یک‌بارمصرف" keyboardType="number-pad" textContentType="oneTimeCode" autoComplete={Platform.OS==='web'?'one-time-code':'sms-otp'} value={code} onChangeText={v=>{setCode(normalizeDigits(v).slice(0,6));setOtpError('');}} maxLength={6} error={otpError} placeholder="ــــــ" onSubmitEditing={()=>{void confirm();}} />
     <AppButton title="تأیید و ورود" fullWidth loading={busy} onPress={()=>{void confirm();}} />
     <View style={{flexDirection:'row-reverse',gap:spacing.sm,flexWrap:'wrap'}}>
      <AppButton title="ارسال مجدد کد" variant="outline" disabled={busy} onPress={()=>{void send();}} />
      <AppButton title="تغییر شماره" variant="ghost" disabled={busy} onPress={()=>sheet.current?.dismiss()} />
     </View>
    </View>
   </AppSheet>
   {opened && <AppText variant="caption" tone="muted">برای بستن پنجره کد، بیرون آن را لمس کنید یا به پایین بکشید.</AppText>}
 </View>;
}
