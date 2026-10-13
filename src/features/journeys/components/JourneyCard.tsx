import { Image, Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import type { Journey } from '../model/journey';
import { earnedStars, percent } from '../model/journey';
const fallback = [require('../../../../assets/journeys/journey-1.png'),require('../../../../assets/journeys/journey-2.png'),require('../../../../assets/journeys/journey-3.png')];
export function JourneyCard({journey,index,active,onPress}: {journey:Journey;index:number;active:boolean;onPress:()=>void}) {
 const {colors}=useAppTheme();
 const image=journey.thumbnailUrl ? {uri:journey.thumbnailUrl} : fallback[index%fallback.length];
 const stars=earnedStars(journey.progressPercent);
 return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${journey.name??`سفر ${index+1}`}، ${stars} ستاره از ۵${journey.isLocked?'، قفل':''}`} accessibilityState={{selected:active,disabled:!!journey.isLocked}} disabled={!!journey.isLocked}
  style={{width:250, borderWidth:active?3:1,borderColor:active?colors.primary:colors.border,borderRadius:radii.xl,backgroundColor:colors.surface,padding:spacing.sm,opacity:journey.isLocked?0.5:active?1:0.82, gap:spacing.sm}}>
  <Image source={image} style={{width:'100%',height:190,borderRadius:radii.lg,backgroundColor:colors.surfaceMuted}} resizeMode="contain" accessibilityLabel={journey.name??'تصویر سفر'}/>
  <AppText weight="700" variant="subtitle" style={{textAlign:'center'}}>{journey.name??`سفر ${index+1}`}</AppText>
  <AppText style={{textAlign:'center'}}>{Array.from({length:5},(_,i)=>i<stars?'★':'☆').join(' ')}</AppText>
  <View style={{height:8,borderRadius:10,backgroundColor:colors.surfaceMuted,overflow:'hidden'}}><View style={{height:8,width:`${percent(journey.progressPercent)}%`,backgroundColor:colors.primary}}/></View>
  <AppText tone="muted" style={{textAlign:'center'}}>{Math.round(percent(journey.progressPercent))}٪ پیشرفت</AppText>
  {journey.isLocked&&<AppText style={{textAlign:'center'}}>🔒 قفل</AppText>}
  {active&&!journey.isLocked&&<AppText weight="700" style={{textAlign:'center',color:colors.primary}}>برای ورود لمس کن ←</AppText>}
 </Pressable>;
}
