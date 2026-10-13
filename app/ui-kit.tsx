import { useState } from 'react';
import { View } from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppAvatar,AppButton,AppCard,AppInput,AppText,EmptyState,ErrorState,LoadingState,RemoteImage } from '@/components/ui';
import { spacing } from '@/theme/tokens';
export default function UIShowcase() {
 const [name,setName]=useState('');const [attempt,setAttempt]=useState(0);const [busy,setBusy]=useState(false);
 return <AppScreen>
  <View style={{gap:spacing.lg}}>
   <AppText variant="hero" weight="700">کتابخانه کامپوننت‌ها</AppText>
   <AppText tone="muted">مرحله ۰۳ — نمونه‌های تعاملی بدون اتصال به سرور</AppText>
   <AppCard><AppText variant="subtitle" weight="700">دکمه‌ها</AppText><View style={{gap:spacing.sm,alignItems:'flex-end'}}>
    <AppButton title="اصلی" onPress={()=>setAttempt(x=>x+1)}/><AppButton title="فرعی" variant="secondary"/><AppButton title="دورخط" variant="outline"/><AppButton title="ساده" variant="ghost"/><AppButton title="مخرب" variant="danger"/><AppButton title="غیرفعال" disabled/><AppButton title="در حال بارگذاری" loading={busy} onPress={()=>setBusy(false)}/><AppButton title={busy?'توقف آزمایش':'آزمایش بارگذاری'} variant="outline" onPress={()=>setBusy(x=>!x)}/>
   </View><AppText tone="muted" variant="caption">تعداد لمس دکمه اصلی: {attempt}</AppText></AppCard>
   <AppCard><AppText variant="subtitle" weight="700">ورودی‌ها</AppText><AppInput label="نام کودک" value={name} onChangeText={setName} placeholder="نام را وارد کنید" required helperText="این فقط نمونه فرم است" error={name.length>0&&name.length<3?'حداقل سه نویسه وارد کنید':undefined}/><AppInput label="ورودی غیرفعال" value="نمونه" editable={false}/></AppCard>
   <AppCard><AppText variant="subtitle" weight="700">تصویر و آواتار</AppText><View style={{flexDirection:'row-reverse',gap:spacing.sm}}><AppAvatar name="آراد"/><AppAvatar name="سارا" size={64}/></View><RemoteImage source={{uri:'https://invalid.example.test/image.png'}} alt="تصویر نمونه ناموجود" height={96}/></AppCard>
   <AppCard><AppText variant="subtitle" weight="700">حالت‌های نمایش</AppText><LoadingState/><EmptyState description="هنوز داده‌ای ثبت نشده است"/><ErrorState onRetry={()=>setAttempt(x=>x+1)}/></AppCard>
  </View>
 </AppScreen>;
}
