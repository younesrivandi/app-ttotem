import { useRef, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppHeader } from '@/components/navigation/AppHeader';
import { AppSheet } from '@/components/overlays/AppSheet';
import { AppDialog } from '@/components/overlays/AppDialog';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/theme/tokens';

export default function NavigationLab() {
 const ref=useRef<BottomSheetModal>(null);
 const [dialog,setDialog]=useState(false);
 return <AppScreen>
   <AppHeader title="آزمایش ناوبری" />
   <View style={{gap:spacing.md,paddingVertical:spacing.lg}}>
    <AppText>تب‌ها، Stack، دیالوگ و شیت را تست کنید. این صفحه نمونه است.</AppText>
    <AppButton title="باز کردن Bottom Sheet" onPress={()=>ref.current?.present()}/>
    <AppButton title="باز کردن Dialog" variant="outline" onPress={()=>setDialog(true)}/>
    <AppButton title="ورود (Modal Route)" variant="secondary" onPress={()=>router.push('/login')}/>
    <AppButton title="لینک نمونه عضویت" variant="ghost" onPress={()=>router.push('/join/demo')}/>
   </View>
   <AppSheet ref={ref}><View style={{gap:spacing.md}}>
     <AppText weight="700">شیت استاندارد</AppText><AppText>روی موبایل به پایین بکشید یا روی پس‌زمینه بزنید تا بسته شود.</AppText>
     <AppButton title="بستن" onPress={()=>ref.current?.dismiss()}/>
   </View></AppSheet>
   <AppDialog visible={dialog} title="پنجره تأیید" message="این یک نمونه از دیالوگ چندپلتفرمی است."
      onDismiss={()=>setDialog(false)} onConfirm={()=>setDialog(false)} />
 </AppScreen>;
}
