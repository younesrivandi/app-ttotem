import { forwardRef,useMemo,useState } from 'react';
import { Pressable,View,Image } from 'react-native';
import { BottomSheetModal,BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { DateWheel } from './DateWheel';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { daysInJalaliMonth,jalaliToIso,persianMonths } from '../model/jalali';
import { validateChildForm,type CreateChildPayload } from '../model/child';
import { avatarOptions,avatarPaths,type Gender } from './ChildAvatar';
export type AddChildSheetHandle=BottomSheetModal;
type Props={saving:boolean;onSave:(payload:CreateChildPayload)=>Promise<void>;serverError:string};
function Choice({title,active,onPress}:{title:string;active:boolean;onPress:()=>void}) {
 const {colors}=useAppTheme();return <Pressable accessibilityRole="button" accessibilityState={{selected:active}} onPress={onPress} style={{padding:10,minHeight:44,borderRadius:10,borderWidth:1,borderColor:active?colors.primary:colors.border,backgroundColor:active?colors.accentSoft:colors.surface}}><AppText>{title}</AppText></Pressable>;
}
export const AddChildSheet=forwardRef<AddChildSheetHandle,Props>(function AddChildSheet({saving,onSave,serverError},ref) {
 const {colors}=useAppTheme();
 const [firstName,setFirstName]=useState('');const [lastName,setLastName]=useState('');const [nationalCode,setNationalCode]=useState('');
 const [gender,setGender]=useState<Gender>('boy');const [avatar,setAvatar]=useState(0);
 const [year,setYear]=useState(1400);const [month,setMonth]=useState(1);const [day,setDay]=useState(1);
 const [formError,setFormError]=useState('');
 const maxDay=useMemo(()=>daysInJalaliMonth(year,month),[year,month]);
 const validDay=Math.min(day,maxDay);
 const submit=async()=>{
 const result=validateChildForm(firstName,lastName,nationalCode);
 if(!result.success){setFormError(result.error.issues[0]?.message??'ورودی نامعتبر است.');return;}
 setFormError('');
 await onSave({firstName:result.data.firstName,lastName:result.data.lastName,birthDate:jalaliToIso(year,month,validDay),nationalCode:result.data.nationalCode||null,gender,avatarId:null,avatarUrl:avatarPaths[gender][avatar]});
 // Form only resets on successful mutation; errors remain visible for correction.
 setFirstName('');setLastName('');setNationalCode('');setYear(1400);setMonth(1);setDay(1);setGender('boy');setAvatar(0);
 };
 const years=Array.from({length:18},(_,i)=>({value:1405-i,label:String(1405-i)}));
 const months=persianMonths.map((label,i)=>({value:i+1,label}));
 const days=Array.from({length:maxDay},(_,i)=>({value:i+1,label:String(i+1)}));
 return <BottomSheetModal ref={ref} snapPoints={['90%']} enableDynamicSizing={false} enablePanDownToClose={!saving} backgroundStyle={{backgroundColor:colors.surface}} handleIndicatorStyle={{backgroundColor:colors.textMuted}}>
 <View style={{flex:1,minHeight:0}}>
 <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:spacing.sm}}>
  <AppText variant="title" weight="700">افزودن کودک</AppText>
 </View>
 <BottomSheetScrollView style={{flex:1}} keyboardShouldPersistTaps="handled" nestedScrollEnabled contentContainerStyle={{padding:spacing.lg,gap:spacing.md,paddingBottom:spacing.lg}}>
 <AppInput label="نام" required value={firstName} onChangeText={setFirstName} maxLength={80}/>
 <AppInput label="نام خانوادگی" value={lastName} onChangeText={setLastName} maxLength={100}/>
 <AppInput label="کد ملی (اختیاری)" value={nationalCode} keyboardType="number-pad" onChangeText={setNationalCode} maxLength={10}/>
 <AppText weight="700">تاریخ تولد (شمسی)</AppText>
 
 <View style={{flexDirection:"row-reverse",gap:8}}>
 <DateWheel label="سال" options={years} value={year} onChange={v=>{setYear(v);setDay(d=>Math.min(d,daysInJalaliMonth(v,month)));}} />
 <DateWheel label="ماه" options={months} value={month} onChange={v=>{setMonth(v);setDay(d=>Math.min(d,daysInJalaliMonth(year,v)));}} />
 <DateWheel label="روز" options={days} value={validDay} onChange={setDay} />
 </View>
 <AppText weight="700">جنسیت</AppText>
 <View style={{flexDirection:'row-reverse',gap:8}}><Choice title="پسر" active={gender==='boy'} onPress={()=>{setGender('boy');setAvatar(0);}}/><Choice title="دختر" active={gender==='girl'} onPress={()=>{setGender('girl');setAvatar(0);}}/></View>
 <AppText weight="700">انتخاب آواتار</AppText>
 <View style={{flexDirection:'row-reverse',gap:12}}>{avatarOptions[gender].map((source,i)=><Pressable key={i} onPress={()=>setAvatar(i)} accessibilityRole="button" accessibilityLabel={`آواتار ${i+1}`} accessibilityState={{selected:avatar===i}} style={{borderColor:avatar===i?colors.primary:colors.border,borderWidth:2,borderRadius:36,padding:3}}><Image source={source} style={{width:48,height:48,borderRadius:24}} /></Pressable>)}</View>
 {!!(formError||serverError)&&<AppText tone="error" accessibilityRole="alert">{formError||serverError}</AppText>}
 </BottomSheetScrollView>
 <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:spacing.lg,backgroundColor:colors.surface}}>
  <AppButton title="ذخیره پروفایل" loading={saving} disabled={saving} fullWidth onPress={()=>{void submit();}} />
 </View>
 </View></BottomSheetModal>;
});
