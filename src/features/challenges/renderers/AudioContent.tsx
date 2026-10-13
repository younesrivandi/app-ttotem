import {useCallback,useEffect} from 'react';
import {View} from 'react-native';
import {useAudioPlayer,useAudioPlayerStatus} from 'expo-audio';
import {AppButton} from '@/components/ui/AppButton';
import {AppText} from '@/components/ui/AppText';

export function AudioContent({uri,completed,onFinish}:{uri:string;completed:boolean;onFinish:()=>void}){
 const player=useAudioPlayer(uri,{updateInterval:250});
 const status=useAudioPlayerStatus(player);
 const finished=useCallback(()=>onFinish(),[onFinish]);
 useEffect(()=>{if(status.didJustFinish)finished();},[status.didJustFinish,finished]);
 return <View style={{gap:10}}>
  <AppButton title={status.playing?'مکث صدا':'پخش صدا'} variant="secondary" disabled={!status.isLoaded} onPress={()=>status.playing?player.pause():player.play()}/>
  <AppText tone="muted">{completed?'فایل صوتی تا انتها پخش شد ✓':!status.isLoaded?'در حال بارگذاری صدا…':`زمان پخش: ${Math.floor(status.currentTime)} / ${Math.floor(status.duration)} ثانیه`}</AppText>
 </View>;
}
