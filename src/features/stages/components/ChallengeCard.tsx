import { Pressable, View } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/theme/tokens';
import type { Challenge } from '../model/challenges';
import { challengeDone,kindIcon,kindLabel } from '../model/challenges';
export function ChallengeCard({challenge,index,locked,onPress}:{challenge:Challenge;index:number;locked:boolean;onPress:()=>void}){
 const done=challengeDone(challenge);return <Pressable disabled={locked} onPress={onPress} accessibilityRole="button" accessibilityState={{disabled:locked}} accessibilityLabel={`${challenge.title??`چالش ${index+1}`}، ${locked?'قفل':done?'تمام شده':challenge.allowResume?'ادامه':'شروع'}`} style={{opacity:locked?.55:1}}>
 <AppCard><View style={{flexDirection:'row-reverse',alignItems:'center',gap:spacing.sm}}><AppText variant="subtitle">{locked?'🔒':done?'✅':kindIcon(challenge.kind)}</AppText><View style={{flex:1,gap:spacing.xs}}><AppText tone="muted" variant="caption">چالش {index+1} · {kindLabel(challenge.kind)}</AppText><AppText weight="700">{challenge.title??`چالش ${index+1}`}</AppText><AppText tone="muted" variant="caption">⏱ {challenge.standardTime??'—'} ثانیه · ★ {challenge.baseScore??'—'} امتیاز</AppText></View><AppText tone="primary">{locked?'قفل':done?'تمام':challenge.allowResume?'ادامه':'شروع'}</AppText></View></AppCard>
 </Pressable>;
}
