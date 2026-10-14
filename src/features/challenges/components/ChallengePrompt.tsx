import { Image, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { AudioContent } from '../renderers/AudioContent';
import { VideoContent } from '../renderers/VideoContent';

type MediaValue = { text?: string | null; title?: string | null; imageUrl?: string | null; audioUrl?: string | null } | string | null | undefined;
type Props = {
 title?: MediaValue;
 showTextTitle?: boolean;
 titleMediaType?: string | null;
 titleMediaUrl?: string | null;
 instructionAudioUrl?: string | null;
 prompt?: MediaValue;
 titleImageUrl?: string | null;
 titleAudioUrl?: string | null;
 imageUrl?: string | null;
 audioUrl?: string | null;
};

const textValue = (value: MediaValue) => typeof value === 'string' ? value :
 value?.text ?? value?.title ?? null;
const imageValue = (value: MediaValue) => typeof value === 'object' && value ? value.imageUrl : null;
const audioValue = (value: MediaValue) => typeof value === 'object' && value ? value.audioUrl : null;

/** Challenge instructions can be text, an image, audio, or a combination. */
export function ChallengePrompt({title,prompt,titleImageUrl,titleAudioUrl,imageUrl,audioUrl,showTextTitle=true,titleMediaType,titleMediaUrl,instructionAudioUrl}:Props) {
 const heading = showTextTitle ? textValue(title) : null;
 const description = showTextTitle ? textValue(prompt) : null;
 const mediaType=(titleMediaType??'').toLowerCase();
 const picture = (mediaType==='image'?titleMediaUrl:null) ?? titleImageUrl ?? imageUrl ?? imageValue(title) ?? imageValue(prompt);
 const audio = ((mediaType==='audio'||mediaType==='voice')?titleMediaUrl:null) ?? titleAudioUrl ?? audioUrl ?? audioValue(title) ?? audioValue(prompt);
 const video = mediaType==='video'?titleMediaUrl:null;
 const instructionAudio = instructionAudioUrl && instructionAudioUrl!==audio?instructionAudioUrl:null;
 if (!heading && !description && !picture && !audio && !video && !instructionAudio) return null;
 return <View style={{gap:12,paddingVertical:12,paddingHorizontal:4}}>
  {!!heading && <AppText variant="title" weight="700" style={{textAlign:'right',color:'#30234F'}}>{heading}</AppText>}
  {!!description && description!==heading && <AppText tone="muted" style={{textAlign:'right'}}>{description}</AppText>}
  {!!picture && <View style={{borderRadius:18,overflow:'hidden',backgroundColor:'#FFFFFF',padding:8,
   borderWidth:1,borderColor:'#EEE5F5'}}>
   <Image source={{uri:picture}} resizeMode="contain" style={{width:'100%',height:210}} accessibilityLabel="تصویر سؤال"/>
  </View>}
  {!!video && <VideoContent key={video} uri={video} completed={false} onFinish={()=>{}}/>}
  {!!audio && <View style={{padding:12,borderRadius:18,backgroundColor:'#F0E9FC',borderWidth:1,borderColor:'#E1D4F3'}}>
   <AppText weight="700" style={{color:'#5B3993',textAlign:'right',fontSize:12,marginBottom:8}}>🔊 گوش کن</AppText>
   <AudioContent key={audio} uri={audio} completed={false} onFinish={()=>{}}/>
  </View>}
  {!!instructionAudio && <View style={{padding:10,borderRadius:16,backgroundColor:'#F4F0FA'}}>
   <AppText weight="700" style={{textAlign:'right',fontSize:12,color:'#7051A4'}}>🔊 راهنمای صوتی چالش</AppText>
   <AudioContent key={instructionAudio} uri={instructionAudio} completed={false} onFinish={()=>{}}/>
  </View>}
 </View>;
}
