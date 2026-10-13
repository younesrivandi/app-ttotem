import {useEffect,useRef,useState} from 'react';
import {View} from 'react-native';
import {AudioModule,RecordingPresets,setAudioModeAsync,useAudioRecorder,useAudioRecorderState} from 'expo-audio';
import {AppButton} from '@/components/ui/AppButton';
import {AppText} from '@/components/ui/AppText';
import {AudioContent} from './AudioContent';
import {recordingToDataUrl} from '../services/recordingDataUrl';
import {gameHaptics} from '../services/feedback';

type Props={onReady:(dataUrl:string)=>void;onRecordingChange:(recording:boolean)=>void;disabled?:boolean;referenceAudioUrl?:string};
const errMessage=(e:unknown)=>e instanceof Error?e.message:'خطای ضبط صدا';
/** This component owns the recorder. No fake answer is sent on permission denial. */
export function VoiceRecorder({onReady,onRecordingChange,disabled=false,referenceAudioUrl}:Props){
 const recorder=useAudioRecorder(RecordingPresets.HIGH_QUALITY);
 const status=useAudioRecorderState(recorder,250);
 const [uri,setUri]=useState<string|null>(null);
 const [completed,setCompleted]=useState(false);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const active=useRef(false);
 const mounted=useRef(true);
 useEffect(()=>()=>{mounted.current=false;if(active.current)void recorder.stop().catch(()=>{});},[recorder]);
 const start=async()=>{
  if(disabled||busy||active.current)return;
  setBusy(true);setError('');setUri(null);setCompleted(false);onReady('');
  try{
   const permission=await AudioModule.requestRecordingPermissionsAsync();
   if(!permission.granted)throw new Error('دسترسی میکروفون داده نشد. مجوز را در تنظیمات دستگاه یا مرورگر فعال کن.');
   await setAudioModeAsync({playsInSilentMode:true,allowsRecording:true});
   await recorder.prepareToRecordAsync();
   recorder.record();active.current=true;onRecordingChange(true);void gameHaptics.start();
  }catch(e){if(mounted.current)setError(errMessage(e));onRecordingChange(false)}
  finally{if(mounted.current)setBusy(false)}
 };
 const stop=async()=>{
  if(!active.current||busy)return;
  setBusy(true);setError('');
  try{
   await recorder.stop();active.current=false;onRecordingChange(false);
   const newUri=recorder.uri;
   if(!newUri)throw new Error('فایل صوتی ایجاد نشد');
   const encoded=await recordingToDataUrl(newUri);
   if(mounted.current){setUri(newUri);onReady(encoded);void gameHaptics.select()}
  }catch(e){active.current=false;onRecordingChange(false);onReady('');if(mounted.current)setError(errMessage(e))}
  finally{await setAudioModeAsync({allowsRecording:false}).catch(()=>{});if(mounted.current)setBusy(false)}
 };
 const clear=()=>{if(active.current||busy||disabled)return;setUri(null);setCompleted(false);onReady('');setError('')};
 return <View style={{gap:12}}>
  {referenceAudioUrl?<View style={{gap:6}}><AppText weight="600">نمونه صوتی</AppText><AudioContent uri={referenceAudioUrl} completed={completed} onFinish={()=>setCompleted(true)}/></View>:null}
  <AppText>{status.isRecording?'در حال ضبط پاسخ…':uri?'پاسخ صوتی آماده ارسال است.':'برای ضبط پاسخ، دکمه شروع را بزن.'}</AppText>
  <AppButton title={active.current?'پایان ضبط':'شروع ضبط'} disabled={disabled||busy} loading={busy} onPress={()=>{void (active.current?stop():start())}}/>
  {uri&&!active.current?<><AppText tone="muted">پیش‌شنوایی پاسخ ضبط‌شده</AppText><AudioContent uri={uri} completed={false} onFinish={()=>{}}/><AppButton title="حذف و ضبط دوباره" variant="outline" disabled={disabled||busy} onPress={clear}/></>:null}
  {error?<AppText tone="error">{error}</AppText>:null}
 </View>;
}
