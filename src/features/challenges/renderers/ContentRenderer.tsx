import {Image,ScrollView,StyleSheet,View} from 'react-native';
import {AppText} from '@/components/ui/AppText';
import {VideoContent} from './VideoContent';
import {AudioContent} from './AudioContent';

type Props={
 text?:string;
 imageUrl?:string;
 audioUrl?:string;
 videoUrl?:string;
 onMediaFinished:(kind:'audio'|'video')=>void;
 completedMedia:readonly ('audio'|'video')[];
};

/**
 * Occupies the entire available media area without cropping searchable objects.
 * A blurred cover background fills the letterbox while the foreground stays intact.
 */
function ContentImage({uri}:{uri:string}){
 return <View style={{flex:1,minHeight:0,width:'100%',backgroundColor:'#181320',overflow:'hidden'}}>
  <Image source={{uri}} resizeMode="cover" blurRadius={24}
   accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
   style={[StyleSheet.absoluteFillObject,{opacity:0.6}]}/>
  <Image source={{uri}} resizeMode="contain"
   accessibilityLabel="تصویر محتوای چالش"
   style={StyleSheet.absoluteFillObject}/>
 </View>;
}

/** The header and action button are owned by PlayChallengeScreen. */
export function ContentRenderer({text,imageUrl,audioUrl,videoUrl,onMediaFinished,completedMedia}:Props){
 const description=text?.trim();
 const hasSingleVisual=Boolean(imageUrl)!==Boolean(videoUrl);
 const audio=audioUrl?<AudioContent key={audioUrl} uri={audioUrl}
  completed={completedMedia.includes('audio')}
  onFinish={()=>onMediaFinished('audio')}/>:null;
 const video=videoUrl?<VideoContent key={videoUrl} uri={videoUrl}
  completed={completedMedia.includes('video')}
  onFinish={()=>onMediaFinished('video')} fill={hasSingleVisual}/>:null;

 if(hasSingleVisual){
  return <View style={{flex:1,minHeight:0,width:'100%'}}>
   {description?<View style={{paddingHorizontal:16,paddingVertical:10,
    backgroundColor:'#F9F6FE',alignItems:'center',justifyContent:'center'}}>
    <AppText weight="700" style={{textAlign:'center',fontSize:18,lineHeight:28,width:'100%'}}>
     {description}
    </AppText>
   </View>:null}
   {imageUrl?<ContentImage uri={imageUrl}/>:video}
   {audio?<View style={{paddingHorizontal:12,paddingVertical:8,backgroundColor:'#F9F6FE'}}>
    {audio}
   </View>:null}
  </View>;
 }

 // Media-free and multi-visual content still need normal scrolling.
 return <ScrollView style={{flex:1,width:'100%'}}
  contentContainerStyle={{flexGrow:1,gap:10}}
  keyboardShouldPersistTaps="handled">
  {description?<AppText weight="700" style={{textAlign:'center',fontSize:18,lineHeight:28,padding:12}}>
   {description}
  </AppText>:null}
  {imageUrl?<View style={{width:'100%',aspectRatio:1}}>
   <ContentImage uri={imageUrl}/>
  </View>:null}
  {videoUrl?<VideoContent key={videoUrl} uri={videoUrl}
   completed={completedMedia.includes('video')}
   onFinish={()=>onMediaFinished('video')}/>:null}
  {audio}
 </ScrollView>;
}
