import {useCallback,useEffect,useRef,useState} from 'react';
import {Pressable,View} from 'react-native';
import {useAudioPlayer,useAudioPlayerStatus} from 'expo-audio';
import {AppText} from '@/components/ui/AppText';

type Props={uri:string;completed:boolean;onFinish:()=>void};
export function AudioContent({uri,onFinish}:Props){
 const player=useAudioPlayer(uri,{updateInterval:150});
 const status=useAudioPlayerStatus(player);
 const finished=useRef(onFinish);
 finished.current=onFinish;
 const [error,setError]=useState(false);
 const busy=useRef(false);
 const duration=Number.isFinite(status.duration)?status.duration:0;
 const current=Number.isFinite(status.currentTime)?status.currentTime:0;
 const progress=duration>0?Math.min(100,Math.max(0,(current/duration)*100)):0;
 useEffect(()=>{if(status.didJustFinish)finished.current();},[status.didJustFinish]);
 const toggle=useCallback(async()=>{
  if(busy.current||!status.isLoaded)return;
  busy.current=true;setError(false);
  try{
   if(status.playing){player.pause();}
   else{
    if(status.didJustFinish||(duration>0&&current>=duration-0.15))await player.seekTo(0);
    player.play();
   }
  }catch{setError(true);}
  finally{busy.current=false;}
 },[player,status.isLoaded,status.playing,status.didJustFinish,current,duration]);
 return <View style={{gap:7}}>
  <View style={{minHeight:66,paddingHorizontal:13,paddingVertical:10,borderRadius:19,
   borderWidth:1,borderColor:'#E4D7F5',backgroundColor:'#FFFFFF',
   flexDirection:'row-reverse',alignItems:'center',gap:13}}>
   <Pressable accessibilityRole="button" accessibilityLabel={status.playing?'مکث صدا':'پخش صدا'}
    disabled={!status.isLoaded} onPress={()=>{void toggle();}}
    style={{height:44,width:44,borderRadius:16,backgroundColor:'#7950BE',
     opacity:status.isLoaded?1:0.5,justifyContent:'center',alignItems:'center'}}>
    <AppText weight="700" style={{color:'#FFFFFF',fontSize:21,lineHeight:28,textAlign:'center'}}>
     {status.playing?'Ⅱ':'▶'}
    </AppText>
   </Pressable>
   <View style={{flex:1,height:8,borderRadius:99,overflow:'hidden',
    backgroundColor:'#EAE3F4',justifyContent:'center'}}>
    <View style={{height:8,width:`${progress}%`,backgroundColor:'#A779E7',borderRadius:99}}/>
   </View>
  </View>
  {error&&<AppText tone="error" style={{fontSize:11,textAlign:'center'}}>پخش صدا انجام نشد.</AppText>}
 </View>;
}
