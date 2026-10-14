import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'expo-router';
import {Pressable, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {AppText} from '@/components/ui/AppText';
import {AppCard} from '@/components/ui/AppCard';
import {LoadingState,ErrorState} from '@/components/ui/AsyncState';
import {api} from '@/services/api/endpoints';
import {bootstrapSession,currentSession,subscribeSession} from '@/services/auth/session';
import {queryKeys} from '@/services/api/queryKeys';
import {challengesResponseSchema} from '@/features/stages/model/challenges';
import {applyFeedback,buildAttempt,canSubmit,classifyChallenge,connectMatch,initialGameState,moveSorting,resolveNextStep,setStrokes,toggleChoice} from '../engine';
import type {ChallengeSpec,EngineState,ServerFeedback,Stroke,PuzzlePlacement} from '../engine';
import {PuzzleRenderer} from '../renderers/PuzzleRenderer';
import {ChallengePrompt} from '../components/ChallengePrompt';
import {submitAttempt} from '../api/attemptsApi';
import {ChoiceRenderer} from '../renderers/ChoiceRenderer';
import {SortingRenderer} from '../renderers/SortingRenderer';
import {MatchingRenderer} from '../renderers/MatchingRenderer';
import {PathRenderer} from '../renderers/PathRenderer';
import {ContentRenderer} from '../renderers/ContentRenderer';
import {VoiceRecorder} from '../renderers/VoiceRecorder';
import {gameHaptics} from '../services/feedback';
import {spacing} from '@/theme/tokens';
type MediaValue=string|{text?:string;title?:string;imageUrl?:string;audioUrl?:string};
type Detail=ChallengeSpec&{title?:MediaValue;prompt?:MediaValue;description?:string;instruction?:string;audioUrl?:string;titleAudioUrl?:string;titleImageUrl?:string;imageUrl?:string;voiceUrl?:string;data?:ChallengeSpec['data']&{titleMediaType?:string;titleMediaUrl?:string;showTextTitle?:boolean;voiceUrl?:string;title?:MediaValue;prompt?:MediaValue;description?:string;instruction?:string;titleAudioUrl?:string;titleImageUrl?:string;displayImageUrl?:string;imageUrl?:string;text?:string;referenceAudioUrl?:string}};
const message=(error:unknown)=>error instanceof Error?error.message:'خطای نامشخص';
function detailFromResponse(value:unknown):Detail{if(!value||typeof value!=='object')throw new Error('پاسخ چالش معتبر نیست');const obj=value as Record<string,unknown>;if(typeof obj.kind!=='string')throw new Error('نوع چالش در پاسخ سرور موجود نیست');if(obj.data!==undefined&&(typeof obj.data!=='object'||obj.data===null))throw new Error('داده چالش معتبر نیست');return obj as Detail;}
export function PlayChallengeScreen({stageId,challengeId}:{stageId:string;challengeId:string}){
 const router=useRouter();const queryClient=useQueryClient();const inFlight=useRef(false);const latestState=useRef<EngineState|null>(null);const [ready,setReady]=useState(false);const [childId,setChildId]=useState('');const [state,setState]=useState<EngineState|null>(null);const [feedback,setFeedback]=useState<ServerFeedback|null>(null);const [error,setError]=useState('');const [toast,setToast]=useState('');const [drawing,setDrawing]=useState(false);const [placements,setPlacements]=useState<Record<string,PuzzlePlacement>>({});
 useEffect(()=>{let live=true;const sync=()=>{if(live){setChildId(currentSession().childId??'');setReady(true)}};void bootstrapSession().then(sync);const unsub=subscribeSession(sync);return()=>{live=false;unsub()};},[]);
 const enabled=ready&&!!childId&&!!currentSession().child?.accessToken;
 const challenge=useQuery({queryKey:['challenge-detail',childId,stageId,challengeId],queryFn:async()=>detailFromResponse(await api.challenge(stageId,challengeId)),enabled});
 const summary=useQuery({queryKey:queryKeys.challenges(childId,stageId),queryFn:async()=>challengesResponseSchema.parse(await api.challenges(stageId)),enabled});
 const spec=challenge.data;const kind=spec?classifyChallenge(spec):'unsupported';
 useEffect(()=>{inFlight.current=false;latestState.current=null;setState(null);setFeedback(null);setError('');setToast('');setDrawing(false);setPlacements({});},[stageId,challengeId]);
 useEffect(()=>{if(spec){const initial=initialGameState(spec);latestState.current=initial;setState(initial);}},[spec,stageId,challengeId]);
 useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(''),2800);return()=>clearTimeout(id);},[toast]);
 const update=(fn:(s:EngineState)=>EngineState)=>{const current=latestState.current;if(!current)return;const next=fn(current);latestState.current=next;setState(next);};
 const loading=!ready||(enabled&&(challenge.isPending||summary.isPending));
 const sending=state?.submitting??false;const solved=state?.solved??false;
 const proceed=async (hint?:string|null)=>{const fetched=challengesResponseSchema.parse(await api.challenges(stageId));queryClient.setQueryData(queryKeys.challenges(childId,stageId),fetched);const current=fetched.challenges.find(c=>c.challengeId===challengeId);const next=resolveNextStep(challengeId,current?.order??-1,fetched.challenges,hint,fetched.nextChallengeId);if(next.kind==='challenge')router.replace({pathname:'/play/[stageId]/[challengeId]',params:{stageId,challengeId:next.challengeId}});else router.replace({pathname:'/stages/[stageId]',params:{stageId,result:'1'}});};
 const submit=async(override?:EngineState)=>{
  const snapshot=override??latestState.current;
  if(inFlight.current||!snapshot||!spec||snapshot.solved)return;
  const payload=buildAttempt(spec,snapshot,Date.now());
  if(!payload)return;
  inFlight.current=true;setError('');
  update(current=>({...current,submitting:true}));
  try{
   const response=await submitAttempt(stageId,challengeId,payload);
   setFeedback(response);
   update(current=>{
    const updated=applyFeedback(current,response);
    return !response.isCorrect&&kind==='path'?{...updated,strokes:[]}:updated;
   });
   if(!response.isCorrect&&(kind==='path'||kind==='sorting'||kind==='voice'))setToast('پاسخ درست نبود، دوباره تلاش کن!');
   void (response.isCorrect?gameHaptics.correct():gameHaptics.incorrect());
   if(response.isCorrect){
    await Promise.all([
     queryClient.invalidateQueries({queryKey:queryKeys.challenges(childId,stageId)}),
     queryClient.invalidateQueries({queryKey:['child',childId,'stages',stageId,'result']}),
     queryClient.invalidateQueries({queryKey:queryKeys.journeys(childId)}),
    ]);
    if(kind==='sorting'||kind==='path'||kind==='voice') await proceed(response.nextChallengeId);
   }
  }catch(e){
   setError(message(e));
   update(current=>({...current,submitting:false}));
  }finally{inFlight.current=false;}
 };
 const moveSortAndCheck=(from:number,to:number)=>{
  if(inFlight.current||kind!=='sorting')return;
  const current=latestState.current;
  if(!current||current.submitting||current.solved)return;
  const next=moveSorting(current,from,to);
  if(next===current)return;
  latestState.current=next;
  setState(next);
  setFeedback(null);
  void submit(next);
 };
 const finishPathAndCheck=(strokes:Stroke[])=>{
  if(inFlight.current||kind!=='path')return;
  const current=latestState.current;
  if(!current||current.submitting||current.solved)return;
  const next=setStrokes(current,strokes);
  latestState.current=next;setState(next);setFeedback(null);
  void submit(next);
 };
 const placePuzzlePiece=async(pieceId:string,x:number,y:number)=>{
  const current=latestState.current;
  if(kind!=='puzzle'||inFlight.current||!current||current.solved||placements[pieceId])return;
  inFlight.current=true;setError('');setToast('');
  update(value=>({...value,submitting:true}));
  try{
   const raw=await api.activity(stageId,challengeId,'place-piece',{pieceId,x,y},Date.now()-current.startedAt);
   if(!raw||typeof raw!=='object')throw new Error('پاسخ بررسی قطعه معتبر نیست');
   const result=raw as Record<string,unknown>;
   if(!result.isCorrect||!result.canonical||typeof result.canonical!=='object'){
    setToast('جای قطعه درست نیست، دوباره تلاش کن!');
    void gameHaptics.incorrect();
    update(value=>({...value,submitting:false,mistakes:typeof result.mistakeCount==='number'?result.mistakeCount:value.mistakes+1}));
    return;
   }
   const canonical=result.canonical as Record<string,unknown>;
   const values=['x','y','width','height'].map(key=>canonical[key]);
   if(values.some(value=>typeof value!=='number'||!Number.isFinite(value)))throw new Error('مختصات قطعه از سرور معتبر نیست');
   const placement:PuzzlePlacement={pieceId:String(canonical.pieceId??pieceId),x:values[0] as number,y:values[1] as number,
    width:values[2] as number,height:values[3] as number};
   const next={...placements,[pieceId]:placement};
   setPlacements(next);
   void gameHaptics.correct();
   const mistakeCount=typeof result.mistakeCount==='number'?result.mistakeCount:current.mistakes;
   update(value=>({...value,submitting:false,mistakes:mistakeCount}));
   if(result.isReadyToComplete===true){
    // Do not submit a puzzle until the server confirms all pieces are ready.
    const answer=Object.values(next).map(item=>({pieceId:item.pieceId,x:item.x,y:item.y}));
    const feedbackResult=await submitAttempt(stageId,challengeId,{
     answer,timeSpentMilliseconds:Math.max(0,Date.now()-current.startedAt),mistakeCount,
    });
    setFeedback(feedbackResult);
    update(value=>applyFeedback(value,feedbackResult));
    if(feedbackResult.isCorrect){
     await Promise.all([
      queryClient.invalidateQueries({queryKey:queryKeys.challenges(childId,stageId)}),
      queryClient.invalidateQueries({queryKey:['child',childId,'stages',stageId,'result']}),
      queryClient.invalidateQueries({queryKey:queryKeys.journeys(childId)}),
     ]);
     await proceed(feedbackResult.nextChallengeId);
    }else setToast('پازل هنوز کامل نشده، دوباره تلاش کن!');
   }
  }catch(e){
   setError(message(e));
   update(value=>({...value,submitting:false}));
  }finally{inFlight.current=false;}
 };
 const submitRecordedVoice=(dataUrl:string)=>{
  if(inFlight.current||kind!=='voice')return;
  const current=latestState.current;
  if(!current||current.solved)return;
  const next={...current,voiceRecording:dataUrl,recording:false};
  latestState.current=next;setState(next);setFeedback(null);
  void submit(next);
 };
 const data=spec?.data;
 const renderer=(()=>{if(!state||!spec)return null;switch(kind){
 case 'puzzle':return <PuzzleRenderer pieces={data?.pieces??[]} boardImageUrl={data?.boardImageUrl??data?.maskImageUrl} placements={placements} disabled={sending||solved} onDrop={placePuzzlePiece}/>;
 case 'choice':return <ChoiceRenderer options={data?.options??[]} selected={state.selected} onSelect={i=>update(s=>toggleChoice(s,i,data?.options?.length??0,!!data?.allowMultiple))} disabled={sending||solved}/>;
 case 'sorting':return <SortingRenderer items={data?.items??[]} order={state.sortOrder} onMove={moveSortAndCheck} disabled={sending||solved}/>;
 case 'matching':return <MatchingRenderer sources={data?.collections?.[0]??[]} targets={data?.collections?.[1]??[]} matches={state.matches} onConnect={(i,j)=>update(s=>connectMatch(s,i,j,data?.collections?.[0]?.length??0,data?.collections?.[1]?.length??0))} disabled={sending||solved}/>;
 case 'path':return <PathRenderer imageUrl={data?.displayImageUrl} strokes={state.strokes} onChange={(strokes:Stroke[])=>update(s=>setStrokes(s,strokes))} onStrokeEnd={finishPathAndCheck} onDrawingChange={setDrawing} disabled={sending||solved}/>;
 case 'video':case 'content':return <ContentRenderer text={data?.text??spec.description} imageUrl={data?.imageUrl} videoUrl={data?.videoUrl} audioUrl={data?.audioUrl} completedMedia={state.completedMedia} onMediaFinished={mediaKind=>update(s=>s.completedMedia.includes(mediaKind)?s:{...s,completedMedia:[...s.completedMedia,mediaKind]})}/>;
 case 'voice':return <VoiceRecorder key={`${stageId}:${challengeId}`} disabled={sending||solved} onRecorded={submitRecordedVoice} onRecordingChange={value=>update(s=>({...s,recording:value}))}/>;
 default:return <ErrorState title="نوع چالش پشتیبانی نمی‌شود" description={`نوع دریافتی: ${spec.kind}`}/>;
 }})();
 const orderedChallenges=[...(summary.data?.challenges??[])].sort((a,b)=>(a.order??0)-(b.order??0));
 const challengeIndex=orderedChallenges.findIndex(item=>item.challengeId===challengeId);
 const challengeNumber=challengeIndex>=0?challengeIndex+1:1;
 const challengeTotal=orderedChallenges.length;
 return <SafeAreaView edges={['top','bottom','left','right']} style={{flex:1,backgroundColor:'#F9F6FE'}}>
 <View style={{flex:1,width:'100%',maxWidth:880,alignSelf:'center',paddingHorizontal:16,paddingTop:16}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:6}}>
   <Pressable accessibilityRole="button" accessibilityLabel="بازگشت به چالش‌ها"
    onPress={()=>router.replace({pathname:'/stages/[stageId]',params:{stageId}})}
    style={{width:36,height:36,borderRadius:12,backgroundColor:'#FFFFFF',
     justifyContent:'center',alignItems:'center',shadowColor:'#6A4C83',
     shadowOpacity:0.14,shadowRadius:8,elevation:3}}>
    <AppText style={{fontSize:28,lineHeight:32,color:'#382473',textAlign:'center'}}>‹</AppText>
   </Pressable>
   <View style={{flex:1,gap:3}}>
    <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'}}>
     <AppText weight="700" style={{fontSize:11,color:'#3C2772',textAlign:'right'}}>چالش {challengeNumber}</AppText>
     <AppText weight="700" style={{fontSize:11,color:'#15912E',textAlign:'left'}}>
      {challengeTotal? `${challengeTotal} از ${challengeTotal}` : '—'}
     </AppText>
    </View>
    <View style={{height:7,borderRadius:999,overflow:'hidden'}}>
     <Svg width="100%" height="100%" viewBox="0 0 300 7" preserveAspectRatio="none">
      <Defs><LinearGradient id="playHeaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
       <Stop offset="0%" stopColor="#A36ADE"/>
       <Stop offset="55%" stopColor="#C58FA6"/>
       <Stop offset="100%" stopColor="#FFBA35"/>
      </LinearGradient></Defs>
      <Rect width="300" height="7" rx="3.5" fill="url(#playHeaderGradient)"/>
     </Svg>
    </View>
   </View>
  </View>
  {spec && state && <ChallengePrompt
   title={data?.title??spec.title}
   titleMediaType={data?.titleMediaType}
   titleMediaUrl={data?.titleMediaUrl}
   showTextTitle={data?.showTextTitle!==false}
   instructionAudioUrl={data?.audioUrl??data?.voiceUrl??spec.audioUrl??spec.voiceUrl}
   prompt={data?.prompt??spec.prompt??data?.description??spec.instruction}
   titleImageUrl={data?.titleImageUrl??spec.titleImageUrl}
   titleAudioUrl={data?.titleAudioUrl??spec.titleAudioUrl}
   imageUrl={spec.imageUrl}
   audioUrl={undefined}
  />}
   <ScrollView keyboardShouldPersistTaps="handled" scrollEnabled={!drawing} style={{flex:1}}
     contentContainerStyle={{gap:spacing.md,paddingTop:12,paddingBottom:24}}
     nestedScrollEnabled>
     {!ready?<LoadingState title="بررسی نشست کودک…"/>:
     !enabled?<ErrorState title="ابتدا پروفایل کودک را انتخاب کنید" onRetry={()=>router.replace('/children')}/>:
     loading?<LoadingState title="دریافت بازی…"/>:
     challenge.isError||summary.isError?<ErrorState description={message(challenge.error??summary.error)} onRetry={()=>{void challenge.refetch();void summary.refetch()}}/>:
     spec&&state?<>{renderer}
      {feedback&&!feedback.isCorrect&&kind!=='sorting'&&kind!=='path'&&kind!=='puzzle'&&kind!=='voice'?<AppCard><AppText tone="error">پاسخ درست نبود، دوباره تلاش کن.</AppText></AppCard>:null}
      {feedback?.isCorrect&&kind!=='sorting'&&kind!=='path'&&kind!=='puzzle'?<AppCard><AppText>آفرین! پاسخ توسط سرور تأیید شد.</AppText></AppCard>:null}
      {error?<AppText tone="error">{error}</AppText>:null}
     </>:null}
   </ScrollView>
   {!!toast&&<View pointerEvents="none" accessibilityRole="alert" style={{
    position:'absolute',left:20,right:20,bottom:28,zIndex:50,elevation:20,
    backgroundColor:'#38264F',borderRadius:16,paddingHorizontal:18,paddingVertical:14,
    shadowColor:'#241632',shadowOpacity:0.3,shadowRadius:12,
   }}><AppText weight="700" style={{color:'#FFFFFF',textAlign:'center',fontSize:14}}>{toast}</AppText></View>}
   {spec&&state&&enabled&&kind!=='sorting'&&kind!=='path'&&kind!=='puzzle'&&kind!=='voice'&&<View style={{paddingVertical:12,borderTopWidth:1,borderTopColor:'#EDE6F7'}}>
     {feedback?.isCorrect?
       <Pressable accessibilityRole="button" onPress={()=>{void proceed(feedback.nextChallengeId).catch(e=>setError(message(e)));}}
         style={{height:52,borderRadius:15,backgroundColor:'#764EB2',justifyContent:'center',alignItems:'center'}}>
         <AppText weight="700" style={{color:'#FFFFFF',textAlign:'center',fontSize:23}}>←</AppText>
       </Pressable>:
       <Pressable accessibilityRole="button" disabled={sending||!canSubmit(spec,state)||solved}
         onPress={()=>{void submit()}}
         style={{height:52,borderRadius:15,backgroundColor:sending||!canSubmit(spec,state)||solved?'#B6A7CE':'#764EB2',justifyContent:'center',alignItems:'center'}}>
         <AppText weight="700" style={{color:'#FFFFFF',textAlign:'center',fontSize:23}}>→</AppText>
       </Pressable>}
   </View>}
 </View>
 </SafeAreaView>;
}
