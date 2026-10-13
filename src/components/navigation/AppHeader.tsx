import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = { title: string; back?: boolean };
export function AppHeader({title,back=true}:Props) {
 const {colors}=useAppTheme();
 return <View style={{flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between',paddingVertical:spacing.sm}}>
   <AppText weight="700">{title}</AppText>
   {back && <Pressable accessibilityRole="button" accessibilityLabel="بازگشت" onPress={()=>router.canGoBack()?router.back():router.replace('/')} style={{padding:spacing.sm,minHeight:44,minWidth:44,justifyContent:'center'}}>
    <AppText style={{color:colors.primary}}>بازگشت</AppText>
   </Pressable>}
 </View>;
}
