import {useCallback} from 'react';
import {View} from 'react-native';
import {useEvent,useEventListener} from 'expo';
import {useVideoPlayer,VideoView} from 'expo-video';
import {AppButton} from '@/components/ui/AppButton';
import {AppText} from '@/components/ui/AppText';

export function VideoContent({uri,completed,onFinish}:{uri:string;completed:boolean;onFinish:()=>void}){
 const player=useVideoPlayer(uri,p=>{p.loop=false;});
 const {isPlaying}=useEvent(player,'playingChange',{isPlaying:player.playing});
 const finished=useCallback(()=>onFinish(),[onFinish]);
 useEventListener(player,'playToEnd',finished);
 return <View style={{gap:10}}>
  <VideoView player={player} style={{width:'100%',height:230}} nativeControls allowsFullscreen contentFit="contain" />
  <AppButton title={isPlaying?'توقف ویدیو':'پخش ویدیو'} variant="secondary" onPress={()=>isPlaying?player.pause():player.play()}/>
  <AppText tone="muted">{completed?'ویدیو تا انتها پخش شد ✓':'پس از پایان واقعی پخش، تکمیل ویدیو ثبت می‌شود.'}</AppText>
 </View>;
}
