import {useCallback,useEffect,useRef,useState} from 'react';
import {Pressable,View} from 'react-native';
import {useEventListener} from 'expo';
import {useVideoPlayer,VideoView} from 'expo-video';
import {AppText} from '@/components/ui/AppText';

type Props={uri:string;completed:boolean;onFinish:()=>void;fill?:boolean};
type HoldMode='center'|'back'|'forward';
/** Native expo-video playback with touch-friendly press-and-hold controls. */
export function VideoContent({uri,onFinish,fill=false}:Props){
 const player=useVideoPlayer(uri,p=>{p.loop=false;p.timeUpdateEventInterval=0.5;});
 const [playing,setPlaying]=useState(false);
 const [holding,setHolding]=useState<HoldMode|null>(null);
 const [position,setPosition]=useState(0);
 const [duration,setDuration]=useState(0);
 const holdRef=useRef<HoldMode|null>(null);
 const shouldResume=useRef(false);
 const finishRef=useRef(onFinish);
 finishRef.current=onFinish;
 const finished=useCallback(()=>{setPlaying(false);finishRef.current();},[]);
 useEventListener(player,'playToEnd',finished);
 useEventListener(player,'playingChange',e=>setPlaying(e.isPlaying));
 useEventListener(player,'timeUpdate',e=>setPosition(e.currentTime));
 useEventListener(player,'sourceLoad',e=>setDuration(e.duration));
 // Native autoplay works without interaction; browsers may block autoplay with sound.
 useEffect(()=>{try{player.play();}catch{/* Browser autoplay policy can require a tap. */}return()=>{player.pause();player.playbackRate=1;};},[player]);
 const startHold=(mode:HoldMode)=>{
  if(holdRef.current)return;
  holdRef.current=mode;setHolding(mode);
  if(mode==='center'){
   shouldResume.current=player.playing;
   player.pause();
  }else{
   shouldResume.current=player.playing;
   // Seek on entry, then run at 2x while held. Backward hold seeks backward by 10 seconds.
   const step=mode==='forward'?10:-10;
   player.currentTime=Math.max(0,Math.min(player.duration||Infinity,player.currentTime+step));
   if(mode==='forward'){player.playbackRate=2;player.play();}
   else player.pause();
  }
 };
 const endHold=()=>{
  const mode=holdRef.current;
  if(!mode)return;
  holdRef.current=null;setHolding(null);
  player.playbackRate=1;
  if(shouldResume.current)player.play();
  else player.pause();
 };
 const toggle=()=>{if(player.playing)player.pause();else player.play();};
 const time=(seconds:number)=>{const n=Math.max(0,Math.floor(seconds));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
 return <View style={fill?{flex:1,width:'100%',minHeight:0,backgroundColor:'#100B20'}:{width:'100%',aspectRatio:16/9,backgroundColor:'#100B20'}}>
  <VideoView player={player} style={{width:'100%',height:'100%'}} nativeControls={false} playsInline contentFit="contain" />
  <View style={{position:'absolute',top:0,bottom:34,left:0,right:0,flexDirection:'row'}}>
   <Pressable accessibilityRole="button" accessibilityLabel="نگه‌داشتن برای ده ثانیه عقب رفتن"
     onPressIn={()=>startHold('back')} onPressOut={endHold} style={{width:'22%'}} />
   <Pressable accessibilityRole="button" accessibilityLabel="نگه‌داشتن برای مکث، رهاکردن برای ادامه"
     onPressIn={()=>startHold('center')} onPressOut={endHold} style={{flex:1}} />
   <Pressable accessibilityRole="button" accessibilityLabel="نگه‌داشتن برای جلو رفتن با سرعت دوبرابر"
     onPressIn={()=>startHold('forward')} onPressOut={endHold} style={{width:'22%'}} />
  </View>
  {holding?<View pointerEvents="none" style={{position:'absolute',top:12,alignSelf:'center',borderRadius:16,paddingHorizontal:16,paddingVertical:8,backgroundColor:'#100B20BB'}}>
   <AppText style={{color:'#FFF'}}>{holding==='center'?'مکث':holding==='forward'?'جلو رفتن ×۲':'۱۰ ثانیه عقب'}</AppText>
  </View>:null}
  <View style={{position:'absolute',bottom:0,left:0,right:0,height:36,flexDirection:'row',alignItems:'center',paddingHorizontal:10,gap:10,backgroundColor:'#100B20CC'}}>
   <Pressable accessibilityRole="button" accessibilityLabel={playing?'توقف پخش':'شروع پخش'} onPress={toggle} style={{padding:4,minWidth:32}}>
    <AppText style={{color:'#FFF'}}>{playing?'Ⅱ':'▶'}</AppText>
   </Pressable>
   <View style={{flex:1,height:4,borderRadius:2,backgroundColor:'#FFFFFF55',overflow:'hidden'}}>
    <View style={{height:4,width:`${duration>0?Math.min(100,position/duration*100):0}%`,backgroundColor:'#FFF'}}/>
   </View>
   <AppText style={{color:'#FFF',fontSize:11}}>{time(position)} / {time(duration)}</AppText>
  </View>
 </View>;
}
