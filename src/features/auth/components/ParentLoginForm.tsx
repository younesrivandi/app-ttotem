import { useEffect, useRef, useState } from 'react';
import { View, Image, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { AppButton, AppInput, AppText } from '@/components/ui';
import { AppSheet, type AppSheetHandle } from '@/components/overlays/AppSheet';
import { spacing } from '@/theme/tokens';
import { bootstrapSession, currentSession } from '@/services/auth/session';
import { readPendingJoin } from '@/features/groups/services/pendingJoin';
import { requestParentOtp, verifyParentOtp } from '../api/parentAuth';
import { normalizeDigits, mobileSchema, otpSchema } from '../model/otp';
function errorMessage(e:unknown):string {return e instanceof z.ZodError ? e.issues[0]?.message??'داده ورودی معتبر نیست.' : e instanceof Error?e.message:'ارتباط با سرور برقرار نشد.';}
export function ParentLoginForm() {
 const router=useRouter();
 const sheet=useRef<AppSheetHandle>(null);
 const [mobile,setMobile]=useState('');const [code,setCode]=useState('');
 const [verifiedMobile,setVerifiedMobile]=useState('');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [otpError,setOtpError]=useState('');
 
 useEffect(()=>{let active=true;void bootstrapSession().then(()=>{if(active && currentSession().parent?.accessToken){void readPendingJoin().then(slug=>{if(active)router.replace(slug?`/join/${encodeURIComponent(slug)}`:'/children');});}});return ()=>{active=false;};},[router]);
 async function send() {
 if(busy)return;
 const parsed=mobileSchema.safeParse(normalizeDigits(mobile));
 if(!parsed.success){setError(parsed.error.issues[0]?.message??'شماره موبایل نامعتبر است.');return;}
 setBusy(true);setError('');
 try {const normalized=await requestParentOtp(parsed.data);setVerifiedMobile(normalized);setMobile(normalized);setCode('');setOtpError('');sheet.current?.present();}
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
 return <View style={{width:'100%',alignSelf:'center',gap:22}}>
   <View style={{alignItems:'center',marginBottom:0}}>
     <Image source={require('../../../../assets/image/logo.png')} resizeMode="contain" accessibilityLabel="لوگوی تی‌توتم" style={{width:252,height:78}}/>
     <AppText style={{color:'#8036B1',fontWeight:'700',textAlign:'center',marginTop:-3}}>هر کودک یک دنیا</AppText>
   </View>
   <View style={{gap:24}}>
     <View style={{position:'relative',justifyContent:'center'}}>
       <AppInput label="شماره موبایل" keyboardType="phone-pad" textContentType="telephoneNumber"
         value={mobile} onChangeText={v=>{setMobile(v);setError('');}}
         placeholder="شماره موبایل خود را وارد کنید" maxLength={18} error={error}
         onSubmitEditing={()=>{void send();}}
         style={{backgroundColor:'#FFFFFF',borderWidth:0,borderRadius:999,minHeight:54,paddingRight:48,paddingLeft:20,color:'#334155',textAlign:'right',shadowColor:'#263E75',shadowOffset:{width:0,height:6},shadowOpacity:0.12,shadowRadius:14,elevation:4}}/>
       <View pointerEvents="none" style={{position:'absolute',right:17,top:14}}>
         <AppText style={{fontSize:19,lineHeight:25,color:'#7B43C3'}}>♙</AppText>
       </View>
     </View>
     <AppButton title="ورود" fullWidth loading={busy} onPress={()=>{void send();}}
       style={{borderRadius:999,minHeight:54,backgroundColor:'#7742C2',shadowColor:'#4A218B',shadowOffset:{width:0,height:7},shadowOpacity:0.24,shadowRadius:10,elevation:7}}/>
     <AppText variant="caption" style={{color:'#7D6385',textAlign:'center',fontSize:11}}>
       با ورود، شرایط و قوانین را می‌پذیرید.
     </AppText>
   </View>
   <AppSheet ref={sheet} snapPoints={['65%','90%']} onDismiss={()=>{setOtpError('');}}>
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

 </View>;
}
