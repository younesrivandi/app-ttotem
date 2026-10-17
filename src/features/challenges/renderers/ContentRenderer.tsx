import {Image,ScrollView,View,useWindowDimensions} from 'react-native';
import {AppText} from '@/components/ui/AppText';
import {VideoContent} from './VideoContent';
import {AudioContent} from './AudioContent';

type Props={text?:string;imageUrl?:string;audioUrl?:string;videoUrl?:string;onMediaFinished:(kind:'audio'|'video')=>void;completedMedia:readonly ('audio'|'video')[]};
/** Full available viewport for standalone visual media; mixed content remains scrollable. */
export function ContentRenderer({text,imageUrl,audioUrl,videoUrl,onMediaFinished,completedMedia}:Props){
 const {height,width}=useWindowDimensions();
 const standaloneVisual=!!(imageUrl||videoUrl)&&!text&&!audioUrl&&!(imageUrl&&videoUrl);
 const image=imageUrl?<Image
   source={{uri:imageUrl}}
   style={standaloneVisual?{flex:1,width:'100%',height:'100%'}:{width:'100%',height:Math.min(height*0.72,Math.max(280,width*0.9))}}
   resizeMode={standaloneVisual?'cover':'contain'}
   accessibilityLabel="تصویر محتوای چالش"
 />:null;
 const video=videoUrl?<VideoContent key={videoUrl} uri={videoUrl} fill={standaloneVisual}
   completed={completedMedia.includes('video')} onFinish={()=>onMediaFinished('video')}/>:null;
 if(standaloneVisual){
  return <View style={{flex:1,minHeight:0,width:'100%'}}>{image}{video}</View>;
 }
 return <ScrollView style={{flex:1,width:'100%'}} contentContainerStyle={{flexGrow:1,gap:8,paddingHorizontal:0,paddingVertical:0}}
   keyboardShouldPersistTaps="handled">
   {image}
   {text?<AppText>{text}</AppText>:null}
   {video}
   {audioUrl?<AudioContent key={audioUrl} uri={audioUrl} completed={completedMedia.includes('audio')} onFinish={()=>onMediaFinished('audio')}/>:null}
 </ScrollView>;
}
