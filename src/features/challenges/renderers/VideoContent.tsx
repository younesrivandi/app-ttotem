import {useCallback} from 'react';
import {View} from 'react-native';
import {useEventListener} from 'expo';
import {useVideoPlayer,VideoView} from 'expo-video';

export function VideoContent({uri,onFinish,fill=false}:{uri:string;completed:boolean;onFinish:()=>void;fill?:boolean}){
 const player=useVideoPlayer(uri,p=>{p.loop=false;});
 const finished=useCallback(()=>onFinish(),[onFinish]);
 useEventListener(player,'playToEnd',finished);
 return <View style={fill?{flex:1,width:'100%',minHeight:0}:{width:'100%'}}>
  <VideoView player={player} style={fill?{flex:1,width:'100%'}:{width:'100%',aspectRatio:16/9}} nativeControls allowsFullscreen contentFit="contain" />
 </View>;
}
