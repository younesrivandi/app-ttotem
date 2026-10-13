import { Pressable, View } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/theme/tokens';
import type { Stage } from '../model/stages';
import { completed,stageStars } from '../model/stages';
export function StageNode({stage,index,locked,onPress}:{stage:Stage;index:number;locked:boolean;onPress:()=>void}){
 const done=completed(stage);return <Pressable disabled={locked} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${stage.title??`مرحله ${index+1}`}، ${locked?'قفل':done?'انجام شده':'آماده شروع'}`} accessibilityState={{disabled:locked}} style={{opacity:locked?.55:1}}>
  <AppCard style={{gap:spacing.xs}}><View style={{flexDirection:'row-reverse',alignItems:'center',gap:spacing.sm}}><AppText variant="subtitle">{locked?'🔒':done?'✅':'🎯'}</AppText><View style={{flex:1}}><AppText weight="700">{stage.title??`مرحله ${index+1}`}</AppText><AppText tone="muted">{locked?'قفل':done?'تکمیل‌شده':'شروع مرحله'}</AppText></View><AppText tone="primary">{stageStars(stage)} / ۵ ★</AppText></View></AppCard>
 </Pressable>;
}
