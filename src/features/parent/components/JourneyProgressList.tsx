import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing,radii } from '@/theme/tokens';
import { clampPercent, type JourneyProgress } from '../model/statistics';
export function JourneyProgressList({items}:{items:JourneyProgress[]}) {
 const {colors}=useAppTheme();
 if(items.length===0)return null;
 return <View style={{gap:spacing.sm}}><AppText variant="subtitle" weight="700">پیشرفت سفرها</AppText>
 {items.map((item,index)=>{const percent=clampPercent(item.progressPercent);return <View key={`${item.journeyId}-${index}`} style={{gap:spacing.xs}}>
  <View style={{flexDirection:'row-reverse',justifyContent:'space-between',gap:spacing.sm}}>
   <AppText style={{flex:1}}>{item.journeyName||item.name||'سفر بدون نام'}</AppText>
   <AppText weight="700">{Math.round(percent)}٪</AppText>
  </View>
  <View accessibilityRole="progressbar" accessibilityLabel={item.journeyName||item.name||'پیشرفت سفر'} accessibilityValue={{min:0,max:100,now:percent}}
   style={{height:9,backgroundColor:colors.surfaceMuted,borderRadius:radii.md,overflow:'hidden',alignItems:'flex-end'}}>
   <View style={{height:'100%',width:`${percent}%`,backgroundColor:colors.primary,borderRadius:radii.md}}/>
  </View>
 </View>;})}</View>;
}
