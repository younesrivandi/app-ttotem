import { useEffect,useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { EmptyState,ErrorState,LoadingState } from '@/components/ui/AsyncState';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { bootstrapSession,currentSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { fetchLeaderboard } from '../api/leaderboardApi';
const msg=(e:unknown)=>e instanceof Error?e.message:'دریافت جدول رتبه‌بندی ممکن نشد.';
export function LeaderboardScreen(){
 const router=useRouter();const {colors}=useAppTheme();const insets=useSafeAreaInsets();const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;void bootstrapSession().then(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
 const session=currentSession();const childId=session.childId??'';const canRead=ready&&!!session.child?.accessToken;
 const query=useQuery({queryKey:queryKeys.leaderboard(childId),queryFn:fetchLeaderboard,enabled:canRead});
 return <AppScreen contentStyle={{gap:spacing.md,paddingBottom:64+10+Math.max(insets.bottom,12)+spacing.lg}}>
  <View style={{alignItems:'center',gap:8,paddingTop:spacing.sm,paddingBottom:spacing.sm}}>
   <AppText variant="title" weight="700" style={{textAlign:'center'}}>برترین‌های تی تو تم</AppText>
   <AppText tone="muted" style={{textAlign:'center'}}>با هر ماجراجویی، به رتبه‌های بالاتر نزدیک شو!</AppText>
  </View>
  {!ready?<LoadingState title="بررسی نشست کودک…"/>:!canRead?<View style={{gap:spacing.sm}}><EmptyState title="ابتدا کودک را انتخاب کنید" description="رتبه‌بندی متعلق به نشست کودک است."/><AppButton title="انتخاب کودک" onPress={()=>router.push('/children')}/></View>:
  query.isLoading?<LoadingState title="دریافت رتبه‌بندی…"/>:query.isError?<ErrorState description={msg(query.error)} onRetry={()=>{void query.refetch();}}/>:
  !query.data?.length?<EmptyState title="هنوز رتبه‌ای ثبت نشده"/>:
  <View style={{gap:spacing.sm}}>
   {query.data.map((item,index)=>{
    const rank=item.rank??index+1;
    return <View key={`${item.childProfileId??item.rank??index}-${index}`}
     accessibilityLabel={`رتبه ${rank}، ${item.displayName??item.name??'ماجراجو'}، ${item.score??0} ستاره`}
     style={{flexDirection:'row-reverse',alignItems:'center',gap:spacing.sm,minHeight:74,paddingHorizontal:spacing.md,paddingVertical:12,borderRadius:20,
      borderColor:item.isCurrentChild?colors.primary:colors.border,borderWidth:item.isCurrentChild?2:1,
      backgroundColor:item.isCurrentChild?colors.accentSoft:colors.surface}}>
     <View style={{width:46,height:46,borderRadius:15,backgroundColor:colors.surfaceMuted,alignItems:'center',justifyContent:'center'}}>
      {rank<=3?<AppText style={{fontSize:26}}>{rank===1?'🥇':rank===2?'🥈':'🥉'}</AppText>:
       <AppText weight="700" style={{fontSize:18,color:colors.primary}}>{rank}</AppText>}
     </View>
     <View style={{flex:1,minWidth:0,gap:3}}>
      <AppText weight="700" numberOfLines={1}>{item.displayName??item.name??'ماجراجو'}</AppText>
      <AppText variant="caption" tone="muted">{item.isCurrentChild?'جایگاه شما':`رتبه ${rank}`}</AppText>
     </View>
     <View style={{flexDirection:'row-reverse',alignItems:'center',gap:5,paddingHorizontal:10,paddingVertical:7,borderRadius:999,backgroundColor:colors.surfaceMuted}}>
      <AppText weight="700" style={{color:colors.primary}}>{item.score??0}</AppText><AppText>⭐</AppText>
     </View>
    </View>;
   })}
  </View>}
 </AppScreen>;
}
