import {useEffect,useRef,useState} from 'react';
import {View} from 'react-native';
import {useRouter} from 'expo-router';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {AppScreen} from '@/components/layout/AppScreen';
import {AppText} from '@/components/ui/AppText';
import {AppButton} from '@/components/ui/AppButton';
import {AppCard} from '@/components/ui/AppCard';
import {LoadingState,ErrorState} from '@/components/ui/AsyncState';
import {api} from '@/services/api/endpoints';
import {bootstrapSession,currentSession,subscribeSession} from '@/services/auth/session';
import {queryKeys} from '@/services/api/queryKeys';
import {challengesResponseSchema} from '@/features/stages/model/challenges';
import {applyFeedback,buildAttempt,canSubmit,classifyChallenge,connectMatch,initialGameState,moveSorting,resolveNextStep,setStrokes,toggleChoice} from '../engine';
import type {ChallengeSpec,EngineState,ServerFeedback,Stroke} from '../engine';
import {submitAttempt} from '../api/attemptsApi';
import {ChoiceRenderer} from '../renderers/ChoiceRenderer';
import {SortingRenderer} from '../renderers/SortingRenderer';
import {MatchingRenderer} from '../renderers/MatchingRenderer';
import {PathRenderer} from '../renderers/PathRenderer';
import {ContentRenderer} from '../renderers/ContentRenderer';
import {VoiceRecorder} from '../renderers/VoiceRecorder';
import {gameHaptics} from '../services/feedback';
import {spacing} from '@/theme/tokens';
type Detail=ChallengeSpec&{title?:string;prompt?:string;description?:string;instruction?:string;audioUrl?:string;voiceUrl?:string;data?:ChallengeSpec['data']&{prompt?:string;description?:string;instruction?:string;displayImageUrl?:string;imageUrl?:string;text?:string;referenceAudioUrl?:string}};
const message=(error:unknown)=>error instanceof Error?error.message:'خطای نامشخص';
function detailFromResponse(value:unknown):Detail{if(!value||typeof value!=='object')throw new Error('پاسخ چالش معتبر نیست');const obj=value as Record<string,unknown>;if(typeof obj.kind!=='string')throw new Error('نوع چالش در پاسخ سرور موجود نیست');if(obj.data!==undefined&&(typeof obj.data!=='object'||obj.data===null))throw new Error('داده چالش معتبر نیست');return obj as Detail;}
export function PlayChallengeScreen({stageId,challengeId}:{stageId:string;challengeId:string}){
 const router=useRouter();const queryClient=useQueryClient();const inFlight=useRef(false);const [ready,setReady]=useState(false);const [childId,setChildId]=useState('');const [state,setState]=useState<EngineState|null>(null);const [feedback,setFeedback]=useState<ServerFeedback|null>(null);const [error,setError]=useState('');
 useEffect(()=>{let live=true;const sync=()=>{if(live){setChildId(currentSession().childId??'');setReady(true)}};void bootstrapSession().then(sync);const unsub=subscribeSession(sync);return()=>{live=false;unsub()};},[]);
 const enabled=ready&&!!childId&&!!currentSession().child?.accessToken;
 const challenge=useQuery({queryKey:['challenge-detail',childId,stageId,challengeId],queryFn:async()=>detailFromResponse(await api.challenge(stageId,challengeId)),enabled});
 const summary=useQuery({queryKey:queryKeys.challenges(childId,stageId),queryFn:async()=>challengesResponseSchema.parse(await api.challenges(stageId)),enabled});
 const spec=challenge.data;const kind=spec?classifyChallenge(spec):'unsupported';
 useEffect(()=>{inFlight.current=false;setState(null);setFeedback(null);setError('');},[stageId,challengeId]);
 useEffect(()=>{if(spec)setState(initialGameState(spec));},[spec,stageId,challengeId]);
 const update=(fn:(s:EngineState)=>EngineState)=>setState(s=>s?fn(s):s);
 const loading=!ready||(enabled&&(challenge.isPending||summary.isPending));
 const sending=state?.submitting??false;const solved=state?.solved??false;
 const proceed=async (hint?:string|null)=>{const fetched=challengesResponseSchema.parse(await api.challenges(stageId));queryClient.setQueryData(queryKeys.challenges(childId,stageId),fetched);const current=fetched.challenges.find(c=>c.challengeId===challengeId);const next=resolveNextStep(challengeId,current?.order??-1,fetched.challenges,hint,fetched.nextChallengeId);if(next.kind==='challenge')router.replace({pathname:'/play/[stageId]/[challengeId]',params:{stageId,challengeId:next.challengeId}});else router.replace({pathname:'/stages/[stageId]',params:{stageId,result:'1'}});};
 const submit=async()=>{if(inFlight.current||!state||!spec)return;const payload=buildAttempt(spec,state,Date.now());if(!payload)return;inFlight.current=true;setError('');setState(s=>s?{...s,submitting:true}:s);try{const response=await submitAttempt(stageId,challengeId,payload);setFeedback(response);setState(s=>s?applyFeedback(s,response):s);void (response.isCorrect?gameHaptics.correct():gameHaptics.incorrect());if(response.isCorrect){await Promise.all([queryClient.invalidateQueries({queryKey:queryKeys.challenges(childId,stageId)}),queryClient.invalidateQueries({queryKey:['child',childId,'stages',stageId,'result']}),queryClient.invalidateQueries({queryKey:queryKeys.journeys(childId)})]);} }catch(e){setError(message(e));setState(s=>s?{...s,submitting:false}:s);}finally{inFlight.current=false;}};
 const data=spec?.data;
 const renderer=(()=>{if(!state||!spec)return null;switch(kind){
 case 'choice':return <ChoiceRenderer options={data?.options??[]} selected={state.selected} onSelect={i=>update(s=>toggleChoice(s,i,data?.options?.length??0,!!data?.allowMultiple))} disabled={sending||solved}/>;
 case 'sorting':return <SortingRenderer items={data?.items??[]} order={state.sortOrder} onMove={(from,to)=>update(s=>moveSorting(s,from,to))} disabled={sending||solved}/>;
 case 'matching':return <MatchingRenderer sources={data?.collections?.[0]??[]} targets={data?.collections?.[1]??[]} matches={state.matches} onConnect={(i,j)=>update(s=>connectMatch(s,i,j,data?.collections?.[0]?.length??0,data?.collections?.[1]?.length??0))} disabled={sending||solved}/>;
 case 'path':return <PathRenderer imageUrl={data?.displayImageUrl} strokes={state.strokes} onChange={(strokes:Stroke[])=>update(s=>setStrokes(s,strokes))} disabled={sending||solved}/>;
 case 'video':case 'content':return <ContentRenderer text={data?.text??spec.description} imageUrl={data?.imageUrl} videoUrl={data?.videoUrl} audioUrl={data?.audioUrl} completedMedia={state.completedMedia} onMediaFinished={mediaKind=>update(s=>s.completedMedia.includes(mediaKind)?s:{...s,completedMedia:[...s.completedMedia,mediaKind]})}/>;
 case 'voice':return <AppCard><VoiceRecorder key={`${stageId}:${challengeId}`} disabled={sending||solved} referenceAudioUrl={data?.referenceAudioUrl??spec.voiceUrl??data?.audioUrl} onReady={value=>update(s=>({...s,voiceRecording:value}))} onRecordingChange={value=>update(s=>({...s,recording:value}))}/></AppCard>;
 default:return <ErrorState title="نوع چالش پشتیبانی نمی‌شود" description={`نوع دریافتی: ${spec.kind}`}/>;
 }})();
 return <AppScreen contentStyle={{gap:spacing.md}}><AppButton title="بازگشت به چالش‌ها" variant="ghost" onPress={()=>router.replace({pathname:'/stages/[stageId]',params:{stageId}})}/>
 {!ready?<LoadingState title="بررسی نشست کودک…"/>:!enabled?<ErrorState title="ابتدا پروفایل کودک را انتخاب کنید" onRetry={()=>router.replace('/children')}/>:loading?<LoadingState title="دریافت بازی…"/>:challenge.isError||summary.isError?<ErrorState description={message(challenge.error??summary.error)} onRetry={()=>{void challenge.refetch();void summary.refetch()}}/>:spec&&state?<><AppText variant="title" weight="700">{spec.title??'بازی آموزشی'}</AppText><AppText tone="muted">{data?.prompt??spec.prompt??data?.description??spec.instruction??'به پرسش پاسخ بده.'}</AppText>{renderer}{feedback&&!feedback.isCorrect?<AppCard><AppText tone="error">پاسخ درست نبود، دوباره تلاش کن.</AppText></AppCard>:null}{feedback?.isCorrect?<AppCard><AppText>آفرین! پاسخ توسط سرور تأیید شد.</AppText><AppButton title="ادامه بازی" onPress={()=>{void proceed(feedback.nextChallengeId).catch(e=>setError(message(e)))}}/></AppCard>:null}{error?<AppText tone="error">{error}</AppText>:null}{!solved&&<AppButton title="ثبت پاسخ" fullWidth loading={sending} disabled={!canSubmit(spec,state)} onPress={()=>{void submit()}}/>}</>:null}
 </AppScreen>;
}
