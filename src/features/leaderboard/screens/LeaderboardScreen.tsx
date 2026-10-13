import { useEffect,useState } from 'react';
import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { EmptyState,ErrorState,LoadingState } from '@/components/ui/AsyncState';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { bootstrapSession,currentSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { fetchLeaderboard } from '../api/leaderboardApi';
const msg=(e:unknown)=>e instanceof Error?e.message:'دریافت جدول رتبه‌بندی ممکن نشد.';
export function LeaderboardScreen(){
 const router=useRouter();const {colors}=useAppTheme();const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;void bootstrapSession().then(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
 const session=currentSession();const childId=session.childId??'';const canRead=ready&&!!session.child?.accessToken;
 const query=useQuery({queryKey:queryKeys.leaderboard(childId),queryFn:fetchLeaderboard,enabled:canRead});
 return <AppScreen contentStyle={{gap:spacing.md}}>
  <AppText variant="title" weight="700">🏆 برترین‌های تی تو تم</AppText>
  <AppCard><AppText variant="subtitle" weight="700">جدول ستاره‌ها</AppText><AppText tone="muted">با بازی و یادگیری، جایگاهت را بالاتر ببر.</AppText></AppCard>
  {!ready?<LoadingState title="بررسی نشست کودک…"/>:!canRead?<View style={{gap:spacing.sm}}><EmptyState title="ابتدا کودک را انتخاب کنید" description="رتبه‌بندی متعلق به نشست کودک است."/><AppButton title="انتخاب کودک" onPress={()=>router.push('/children')}/></View>:
  query.isLoading?<LoadingState title="دریافت رتبه‌بندی…"/>:query.isError?<ErrorState description={msg(query.error)} onRetry={()=>{void query.refetch();}}/>:
  !query.data?.length?<EmptyState title="هنوز رتبه‌ای ثبت نشده"/>:
  query.data.map((item,index)=><AppCard key={`${item.childProfileId??item.rank??index}-${index}`} style={{borderColor:item.isCurrentChild?colors.primary:colors.border,borderWidth:item.isCurrentChild?2:1}}>
    <View style={{flexDirection:'row-reverse',alignItems:'center',gap:spacing.md}}>
     <AppText weight="700">{index===0?'🥇':index===1?'🥈':index===2?'🥉':'⭐'}</AppText>
     <AppText weight="700">{item.rank??index+1}</AppText>
     <View style={{flex:1}}><AppText weight="700">{item.displayName??item.name??'ماجراجو'}{item.isCurrentChild?' (شما)':''}</AppText></View>
     <AppText weight="700">{item.score??0} ⭐</AppText>
    </View>
   </AppCard>)}
 </AppScreen>;
}
