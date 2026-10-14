import { useEffect,useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams,useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { EmptyState,ErrorState,LoadingState } from '@/components/ui/AsyncState';
import { spacing } from '@/theme/tokens';
import { bootstrapSession,currentSession,subscribeSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { getStageChallenges,getJourneyStages } from '../api/stagesApi';
import { challengeLocked,nextChallengeId } from '../model/challenges';
import { ChallengeCard } from '../components/ChallengeCard';
import { StageResultSheet } from '@/features/results/components/StageResultSheet';
import { tabArtwork } from '@/components/navigation/tabArtwork';
import { storyRunCompleted } from '../model/stages';
const message=(e:unknown)=>e instanceof Error?e.message:'خطای ناشناخته';
export function StageChallengesScreen({stageId}:{stageId:string}){
 const router=useRouter();const insets=useSafeAreaInsets();const params=useLocalSearchParams<{result?:string}>();const [childId,setChildId]=useState('');const [ready,setReady]=useState(false);const [resultOpen,setResultOpen]=useState(false);
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
 const stageType=stagesQuery.data?.stages.find(item=>item.stageId===stageId)?.type?.toLowerCase();
 useEffect(()=>{
  if(params.result==='1'&&complete&&stageType==='story'&&journeyId&&childId){
   storyRunCompleted(childId,journeyId,stageId);
  }
 },[params.result,complete,stageType,journeyId,childId,stageId]);
 const percentage=totalCount>0?Math.round(Math.min(100,completeCount/totalCount*100)):0;
 const journeyBack=()=>{if(journeyId)router.replace({pathname:'/journeys/[journeyId]',params:{journeyId}});else router.replace('/journeys');};
 return <SafeAreaView edges={['top','bottom','left','right']} style={{flex:1,backgroundColor:'#FFFFFF'}}>
 <View style={{flex:1,backgroundColor:'#FFFFFF'}}>
 <ScrollView keyboardShouldPersistTaps="handled" style={{flex:1,backgroundColor:'#FFFFFF'}} contentContainerStyle={{width:'100%',maxWidth:880,alignSelf:'center',paddingHorizontal:16,gap:14,paddingTop:14,paddingBottom:160+insets.bottom,backgroundColor:'#FFFFFF'}}>
  <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',marginBottom:12,gap:12}}>
   <AppText variant="title" weight="700" numberOfLines={1} style={{flex:1,textAlign:'right',color:'#22236A',fontSize:18}}>
    چالش‌های {title??'مرحله'}
   </AppText>
   <Pressable accessibilityRole="button" accessibilityLabel="بازگشت به مراحل" onPress={journeyBack}
    style={{width:36,height:36,borderRadius:12,backgroundColor:'#FFFFFF',borderColor:'#EBDACA',borderWidth:1,
     justifyContent:'center',alignItems:'center',shadowColor:'#9E795F',shadowOpacity:0.15,shadowRadius:6,elevation:2}}>
    <AppText style={{fontSize:29,color:'#30276E',lineHeight:34,textAlign:'center'}}>‹</AppText>
   </Pressable>
  </View>
  {!ready?<LoadingState title="بررسی نشست…"/>:
   !authorized?<View style={{gap:spacing.sm}}><ErrorState title="ابتدا کودک را انتخاب کنید"/><AppButton title="انتخاب کودک" onPress={()=>router.push('/children')}/></View>:
   query.isLoading?<LoadingState title="دریافت چالش‌ها…"/>:
   query.isError?<ErrorState description={message(query.error)} onRetry={()=>{void query.refetch();}}/>:
   <>
    <View style={{backgroundColor:'#6942AD',borderRadius:18,padding:12,marginBottom:2,
     shadowColor:'#5D348E',shadowOpacity:0.28,shadowRadius:10,elevation:5}}>
     <View style={{flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
      <AppText weight="700" style={{color:'#FFFFFF',fontSize:14}}>{completeCount}/{totalCount}</AppText>
      <View style={{backgroundColor:'rgba(255,255,255,0.25)',paddingHorizontal:6,paddingVertical:5,borderRadius:9}}>
       <AppText weight="700" style={{color:'#FFFFFF',fontSize:12}}>{percentage}%</AppText>
      </View>
     </View>
     <View style={{height:5,backgroundColor:'rgba(255,255,255,0.28)',borderRadius:999,overflow:'hidden',
      flexDirection:'row-reverse'}}>
      <View style={{width:`${percentage}%`,height:5,backgroundColor:'#FFD04D',borderRadius:999}}/>
     </View>
    </View>
    {challenges.length===0?<EmptyState title="چالشی برای این مرحله موجود نیست"/>:
     <View style={{gap:13}}>{challenges.map((challenge,index)=>
      <ChallengeCard key={challenge.challengeId} challenge={challenge} index={index}
       locked={challengeLocked(challenge,index,challenges,next)}
       onPress={()=>router.push({pathname:'/play/[stageId]/[challengeId]',params:{stageId,challengeId:challenge.challengeId}})}/>
     )}</View>}
    <View style={{marginTop:3,borderRadius:22,borderWidth:1,borderStyle:'dashed',
     borderColor:'#58D6A7',backgroundColor:'#EEFFF5',paddingHorizontal:14,paddingVertical:17,
     flexDirection:'row-reverse',alignItems:'center',gap:10}}>
     <View style={{width:50,alignItems:'center',justifyContent:'center'}}>
      <AppText style={{fontSize:33,textAlign:'center'}}>🎁</AppText>
     </View>
     <View style={{flex:1,gap:4}}>
      <AppText weight="700" style={{fontSize:12,color:'#554469',textAlign:'right'}}>
       {complete?'آفرین! مرحله کامل شد':'جایزه در انتظار توست!'}
      </AppText>
      <AppText style={{fontSize:10,color:'#899399',textAlign:'right'}}>
       {complete?'نتیجه و جایزه‌ات را ببین':`${Math.max(0,totalCount-completeCount)} چالش دیگر تا تکمیل مرحله`}
      </AppText>
     </View>
     {complete&&<Pressable accessibilityRole="button" onPress={()=>setResultOpen(true)}
      style={{paddingHorizontal:12,paddingVertical:10,borderRadius:13,backgroundColor:'#7549B9'}}>
      <AppText weight="700" style={{fontSize:11,color:'#FFFFFF'}}>دیدن نتیجه</AppText>
     </Pressable>}
    </View>
   </>}
  {authorized&&complete&&<StageResultSheet stageId={stageId} childId={childId}
   open={resultOpen} onClose={()=>setResultOpen(false)}
   onContinue={()=>{setResultOpen(false);router.replace(stageType==='story'&&journeyId?{pathname:'/journeys/[journeyId]',params:{journeyId}}:'/journeys');}}
   onReplay={()=>{setResultOpen(false);router.replace({pathname:'/stages/[stageId]',params:{stageId}});}}/>}
 </ScrollView>
 <View style={{
  position:'absolute',bottom:10+insets.bottom,left:18,right:18,height:64,
  backgroundColor:'#FFFAF4',borderRadius:32,borderWidth:2,borderColor:'#FFFFFF',
  flexDirection:'row',justifyContent:'space-around',alignItems:'center',
  shadowColor:'#55412C',shadowOpacity:0.18,shadowRadius:11,elevation:8,
 }}>
  {([
   {key:'trophy',href:'/leaderboard',label:'رتبه‌بندی'},
   {key:'home',href:'/journeys',label:'خانه'},
   {key:'compass',href:'/parent',label:'بخش والدین'},
  ] as const).map(item=>
   <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={item.label}
    onPress={()=>router.replace(item.href)}
    style={{width:64,height:60,alignItems:'center',justifyContent:'center'}}>
    <Image source={{uri:tabArtwork[item.key]}} resizeMode="contain" style={{width:44,height:44}}/>
    {item.key==='home'&&<View style={{position:'absolute',bottom:0,width:24,height:3,
     borderRadius:2,backgroundColor:'#8141C6'}}/>}
   </Pressable>)}
 </View>
 </View>
 </SafeAreaView>;
}
