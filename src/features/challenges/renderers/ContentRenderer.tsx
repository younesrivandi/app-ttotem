import {Image,View} from 'react-native';
import {AppText} from '@/components/ui/AppText';
import {VideoContent} from './VideoContent';
import {AudioContent} from './AudioContent';

type Props={text?:string;imageUrl?:string;audioUrl?:string;videoUrl?:string;onMediaFinished:(kind:'audio'|'video')=>void;completedMedia:readonly ('audio'|'video')[]};
/** Playback completion comes only from actual media events; no manual "I watched" bypass. */
export function ContentRenderer({text,imageUrl,audioUrl,videoUrl,onMediaFinished,completedMedia}:Props){
 return <View style={{gap:10,flex:1}}>
 {imageUrl?<Image source={{uri:imageUrl}} style={{height:440,width:'100%',maxHeight:520}} resizeMode="contain"/>:null}
 {text?<AppText>{text}</AppText>:null}
 {videoUrl?<VideoContent key={videoUrl} uri={videoUrl} completed={completedMedia.includes('video')} onFinish={()=>onMediaFinished('video')}/>:null}
 {audioUrl?<AudioContent key={audioUrl} uri={audioUrl} completed={completedMedia.includes('audio')} onFinish={()=>onMediaFinished('audio')}/>:null}

 </View>;
}
