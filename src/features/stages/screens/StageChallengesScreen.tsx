import { useEffect,useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams,useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { EmptyState,ErrorState,LoadingState } from '@/components/ui/AsyncState';
import { spacing } from '@/theme/tokens';
import { bootstrapSession,currentSession,subscribeSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { getStageChallenges,getJourneyStages } from '../api/stagesApi';
import { challengeLocked,nextChallengeId } from '../model/challenges';
import { ChallengeCard } from '../components/ChallengeCard';
import { StageResultSheet } from '@/features/results/components/StageResultSheet';
const message=(e:unknown)=>e instanceof Error?e.message:'خطای ناشناخته';
export function StageChallengesScreen({stageId}:{stageId:string}){
 const router=useRouter();const params=useLocalSearchParams<{result?:string}>();const [childId,setChildId]=useState('');const [ready,setReady]=useState(false);const [resultOpen,setResultOpen]=useState(false);
 useEffect(()=>{let alive=true;const sync=()=>{if(alive){setChildId(currentSession().childId??'');setReady(true);}};void bootstrapSession().then(sync);const unsub=subscribeSession(sync);return()=>{alive=false;unsub();};},[]);
 useEffect(()=>{if(params.result==='1')setResultOpen(true);},[params.result,stageId]);
 const authorized=ready&&!!childId&&!!currentSession().child?.accessToken;
 const query=useQuery({queryKey:queryKeys.challenges(childId,stageId),queryFn:()=>getStageChallenges(stageId),enabled:authorized&&!!stageId});
 const journeyId=query.data?.journeyId??'';
 const stagesQuery=useQuery({queryKey:queryKeys.stages(childId,journeyId),queryFn:()=>getJourneyStages(journeyId),enabled:authorized&&!!journeyId});
 const title=query.data?.stageTitle??query.data?.title??query.data?.stage?.title??stagesQuery.data?.stages.find(s=>s.stageId===stageId)?.title;
 const challenges=[...(query.data?.challenges??[])].sort((a,b)=>(a.order??0)-(b.order??0));
 const next=nextChallengeId(challenges,query.data?.nextChallengeId);
 const completeCount=query.data?.completedCount??0;const totalCount=query.data?.totalCount??0;const complete=totalCount>0&&completeCount>=totalCount;
 return <AppScreen contentStyle={{gap:spacing.md}}><AppButton title="بازگشت به سفرها" variant="ghost" onPress={()=>router.push('/journeys')}/><AppText variant="title" weight="700">چالش‌های {title??'مرحله'}</AppText>
 {!ready?<LoadingState title="بررسی نشست…"/>:!authorized?<><ErrorState title="ابتدا کودک را انتخاب کنید"/><AppButton title="انتخاب کودک" onPress={()=>router.push('/children')}/></>:query.isLoading?<LoadingState title="دریافت چالش‌ها…"/>:query.isError?<ErrorState description={message(query.error)} onRetry={()=>{void query.refetch();}}/>: <>
 <AppCard><AppText weight="700">{completeCount} از {totalCount} چالش · {totalCount?Math.round(Math.min(100,completeCount/totalCount*100)):0}٪</AppText></AppCard>
 {challenges.length===0?<EmptyState title="چالشی برای این مرحله موجود نیست"/>:<View style={{gap:spacing.sm}}>{challenges.map((challenge,index)=><ChallengeCard key={challenge.challengeId} challenge={challenge} index={index} locked={challengeLocked(challenge,index,challenges,next)} onPress={()=>router.push({pathname:'/play/[stageId]/[challengeId]',params:{stageId,challengeId:challenge.challengeId}})}/>)}</View>}
 <AppCard><AppText weight="700">{complete?'🎁 آفرین! مرحله کامل شد':'🌟 جایزه در انتظارت است'}</AppText><AppText tone="muted">{complete?'نتیجه و جایزه‌ات را ببین':`${Math.max(0,totalCount-completeCount)} چالش دیگر تا تکمیل مرحله`}</AppText>{complete&&<AppButton title="دیدن نتیجه" onPress={()=>setResultOpen(true)}/>}</AppCard>

 </>}
 {authorized&&complete&&<StageResultSheet stageId={stageId} childId={childId} open={resultOpen} onClose={()=>setResultOpen(false)} onContinue={()=>{setResultOpen(false);router.replace('/journeys');}} onReplay={()=>{setResultOpen(false);router.replace({pathname:'/stages/[stageId]',params:{stageId}});}}/>}
 </AppScreen>;
}
