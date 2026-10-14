import {useEffect,useRef,useState} from 'react';
import {Animated,Easing,Pressable,View} from 'react-native';
import {AudioModule,RecordingPresets,setAudioModeAsync,useAudioRecorder} from 'expo-audio';
import {AppText} from '@/components/ui/AppText';
import {recordingToDataUrl} from '../services/recordingDataUrl';
import {gameHaptics} from '../services/feedback';

type Props={
 disabled?:boolean;
 expectedText?:string;
 onRecorded:(dataUrl:string)=>void;
 onRecordingChange?:(recording:boolean)=>void;
};
const errorText=(e:unknown)=>e instanceof Error?e.message:'خطا در ضبط صدا';
const format=(seconds:number)=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;

export function VoiceRecorder({disabled=false,expectedText,onRecorded,onRecordingChange}:Props){
 const recorder=useAudioRecorder(RecordingPresets.HIGH_QUALITY);
 const [recording,setRecording]=useState(false);
 const [busy,setBusy]=useState(false);
 const [seconds,setSeconds]=useState(0);
 const [error,setError]=useState('');
 const pressed=useRef(false);
 const active=useRef(false);
 const starting=useRef(false);
 const stopping=useRef(false);
 const mounted=useRef(true);
 const startedAt=useRef(0);
 const ticker=useRef<ReturnType<typeof setInterval>|null>(null);
 const scale=useRef(new Animated.Value(1)).current;
 const halo=useRef(new Animated.Value(0)).current;
 const callback=useRef(onRecorded);callback.current=onRecorded;
 const drawingCallback=useRef(onRecordingChange);drawingCallback.current=onRecordingChange;

 useEffect(()=>{
  if(!recording){scale.stopAnimation();halo.stopAnimation();scale.setValue(1);halo.setValue(0);return;}
  const animation=Animated.loop(Animated.parallel([
   Animated.sequence([
    Animated.timing(scale,{toValue:1.06,duration:500,easing:Easing.inOut(Easing.ease),useNativeDriver:true}),
    Animated.timing(scale,{toValue:1,duration:500,easing:Easing.inOut(Easing.ease),useNativeDriver:true}),
   ]),
   Animated.sequence([
    Animated.timing(halo,{toValue:1,duration:650,useNativeDriver:true}),
    Animated.timing(halo,{toValue:0,duration:650,useNativeDriver:true}),
   ]),
  ]));
  animation.start();
  return()=>animation.stop();
 },[recording,scale,halo]);
 useEffect(()=>()=>{mounted.current=false;pressed.current=false;if(ticker.current)clearInterval(ticker.current);if(active.current)void recorder.stop().catch(()=>{});},[recorder]);
 const cleanup=()=>{
  if(ticker.current){clearInterval(ticker.current);ticker.current=null;}
  active.current=false;
  drawingCallback.current?.(false);
  if(mounted.current){setRecording(false);setSeconds(0);setBusy(false);}
 };
 const stop=async()=>{
  if(!active.current||stopping.current)return;
  stopping.current=true;
  if(mounted.current)setBusy(true);
  try{
   await recorder.stop();
   const uri=recorder.uri;
   if(!uri)throw new Error('فایل صوتی ایجاد نشد');
   const dataUrl=await recordingToDataUrl(uri);
   if(mounted.current){callback.current(dataUrl);void gameHaptics.select();}
  }catch(e){if(mounted.current)setError(errorText(e));}
  finally{
   await setAudioModeAsync({allowsRecording:false}).catch(()=>{});
   cleanup();stopping.current=false;
  }
 };
 const start=async()=>{
  if(disabled||starting.current||active.current||stopping.current)return;
  pressed.current=true;starting.current=true;setBusy(true);setError('');
  try{
   const permission=await AudioModule.requestRecordingPermissionsAsync();
   if(!permission.granted)throw new Error('برای ضبط صدا، دسترسی میکروفون را فعال کن.');
   // If released while permission was requested, never start an orphan recording.
   if(!pressed.current)return;
   await setAudioModeAsync({playsInSilentMode:true,allowsRecording:true});
   if(!pressed.current)return;
   await recorder.prepareToRecordAsync();
   if(!pressed.current){await recorder.stop().catch(()=>{});return;}
   recorder.record();
   active.current=true;startedAt.current=Date.now();
   if(mounted.current){setRecording(true);setSeconds(0);}
   drawingCallback.current?.(true);
   ticker.current=setInterval(()=>{if(mounted.current)setSeconds(Math.floor((Date.now()-startedAt.current)/1000));},200);
   void gameHaptics.start();
   if(!pressed.current)await stop();
  }catch(e){if(mounted.current)setError(errorText(e));}
  finally{
   starting.current=false;
   if(!active.current){
    await setAudioModeAsync({allowsRecording:false}).catch(()=>{});
    if(mounted.current)setBusy(false);
   }
  }
 };
 const release=()=>{
  pressed.current=false;
  if(active.current)void stop();
 };
 return <View style={{alignItems:'center',justifyContent:'center',paddingVertical:28,gap:16,
  backgroundColor:'#FFF9EF',borderRadius:28,borderWidth:1,borderColor:'#F2EADD'}}>
  {!!expectedText?.trim()&&<AppText weight="700" style={{fontSize:23,lineHeight:38,color:'#263B78',textAlign:'center',paddingHorizontal:22}}>{expectedText}</AppText>}
  <View style={{width:210,height:210,alignItems:'center',justifyContent:'center'}}>
   <Animated.View pointerEvents="none" style={{position:'absolute',height:190,width:190,borderRadius:95,
    backgroundColor:'#9072DB',opacity:halo.interpolate({inputRange:[0,1],outputRange:[0.1,0.25]}),
    transform:[{scale:halo.interpolate({inputRange:[0,1],outputRange:[1,1.15]})}]}}/>
   <Animated.View style={{transform:[{scale}]}}>
    <Pressable accessibilityRole="button" accessibilityLabel="برای ضبط صدا نگه دارید"
     disabled={disabled||stopping.current}
     onPressIn={()=>{void start();}} onPressOut={release}
     style={{width:152,height:152,borderRadius:76,backgroundColor:recording?'#587ED8':'#705CC5',
      justifyContent:'center',alignItems:'center',shadowColor:'#5D4DA1',shadowOpacity:0.25,
      shadowRadius:18,elevation:7,borderWidth:4,borderColor:'#FFFFFF'}}>
     <AppText weight="700" style={{fontSize:recording?29:44,color:'#FFFFFF',textAlign:'center',lineHeight:54}}>
      {recording?format(seconds):busy?'…':'🎙'}
     </AppText>
    </Pressable>
   </Animated.View>
  </View>
  <AppText weight="700" style={{color:'#4C3B7B',textAlign:'center',fontSize:14}}>
   {recording?'در حال ضبط…':busy?'در حال آماده‌سازی…':'برای ضبط نگه دار'}
  </AppText>
  {!!error&&<AppText tone="error" style={{textAlign:'center',paddingHorizontal:16}}>{error}</AppText>}
 </View>;
}
