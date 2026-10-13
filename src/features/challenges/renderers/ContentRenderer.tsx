import {Image,View} from 'react-native';
import {AppText} from '@/components/ui/AppText';
import {VideoContent} from './VideoContent';
import {AudioContent} from './AudioContent';

type Props={text?:string;imageUrl?:string;audioUrl?:string;videoUrl?:string;onMediaFinished:(kind:'audio'|'video')=>void;completedMedia:readonly ('audio'|'video')[]};
/** Playback completion comes only from actual media events; no manual "I watched" bypass. */
export function ContentRenderer({text,imageUrl,audioUrl,videoUrl,onMediaFinished,completedMedia}:Props){
 return <View style={{gap:16}}>
 {imageUrl?<Image source={{uri:imageUrl}} style={{height:220,width:'100%'}} resizeMode="contain"/>:null}
 {text?<AppText>{text}</AppText>:null}
 {videoUrl?<VideoContent key={videoUrl} uri={videoUrl} completed={completedMedia.includes('video')} onFinish={()=>onMediaFinished('video')}/>:null}
 {audioUrl?<AudioContent key={audioUrl} uri={audioUrl} completed={completedMedia.includes('audio')} onFinish={()=>onMediaFinished('audio')}/>:null}
 {!videoUrl&&!audioUrl?<AppText tone="muted">محتوای آموزشی برای مطالعه آماده است.</AppText>:null}
 </View>;
}
