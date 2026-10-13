import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { EmptyState,ErrorState,LoadingState } from '@/components/ui/AsyncState';
import { spacing } from '@/theme/tokens';
import { bootstrapSession,currentSession,subscribeSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { listJourneys } from '@/features/journeys/api/journeysApi';
import { getJourneyStages } from '../api/stagesApi';
import { completed,isStageLocked,stageStars } from '../model/stages';
import { StageNode } from '../components/StageNode';
const message=(e:unknown)=>e instanceof Error?e.message:'خطای ناشناخته';
export function JourneyStagesScreen({journeyId}:{journeyId:string}){
 const router=useRouter();const [childId,setChildId]=useState('');const [ready,setReady]=useState(false);
 useEffect(()=>{let alive=true;const sync=()=>{if(alive){setChildId(currentSession().childId??'');setReady(true);}};void bootstrapSession().then(sync);const unsub=subscribeSession(sync);return()=>{alive=false;unsub();};},[]);
 const authorized=ready&&!!childId&&!!currentSession().child?.accessToken;
 const stagesQuery=useQuery({queryKey:queryKeys.stages(childId,journeyId),queryFn:()=>getJourneyStages(journeyId),enabled:authorized&&!!journeyId});
 const journeysQuery=useQuery({queryKey:queryKeys.journeys(childId),queryFn:listJourneys,enabled:authorized&&!!journeyId});
 const stages=[...(stagesQuery.data?.stages??[])].sort((a,b)=>(a.order??0)-(b.order??0));
 const journey=journeysQuery.data?.find(item=>item.journeyId===journeyId);
 const title=journey?.name??stagesQuery.data?.journeyName??'دنیای من';
 const earned=stages.reduce((sum,item)=>sum+stageStars(item),0);const total=stages.length*5;const done=stages.filter(completed).length;
 return <AppScreen contentStyle={{gap:spacing.md}}><AppButton title="بازگشت به سفرها" variant="ghost" onPress={()=>router.push('/journeys')}/><AppText variant="title" weight="700">{title}</AppText>
 {!ready?<LoadingState title="بررسی نشست…"/>:!authorized?<><ErrorState title="ابتدا کودک را انتخاب کنید"/><AppButton title="انتخاب کودک" onPress={()=>router.push('/children')}/></>:stagesQuery.isLoading?<LoadingState title="دریافت مراحل…"/>:stagesQuery.isError?<ErrorState description={message(stagesQuery.error)} onRetry={()=>{void stagesQuery.refetch();}}/>:stages.length===0?<EmptyState title="مرحله‌ای برای این سفر پیدا نشد"/>:<>
 <View style={{gap:spacing.sm}}>{stages.map((stage,index)=><StageNode key={stage.stageId} stage={stage} index={index} locked={isStageLocked(stage,index,stages)} onPress={()=>router.push({pathname:'/stages/[stageId]',params:{stageId:stage.stageId}})}/>)}</View>
 <AppText weight="700">⭐ {earned} از {total} ستاره</AppText><AppText tone="muted">{done} مرحله کامل‌شده</AppText>
 </>}
 </AppScreen>;
}
