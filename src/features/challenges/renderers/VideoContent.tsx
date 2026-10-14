import {useCallback} from 'react';
import {View} from 'react-native';
import {useEventListener} from 'expo';
import {useVideoPlayer,VideoView} from 'expo-video';

export function VideoContent({uri,onFinish}:{uri:string;completed:boolean;onFinish:()=>void}){
 const player=useVideoPlayer(uri,p=>{p.loop=false;});
 const finished=useCallback(()=>onFinish(),[onFinish]);
 useEventListener(player,'playToEnd',finished);
 return <View style={{width:'100%'}}>
  <VideoView player={player} style={{width:'100%',height:440}} nativeControls allowsFullscreen contentFit="contain" />
 </View>;
}
