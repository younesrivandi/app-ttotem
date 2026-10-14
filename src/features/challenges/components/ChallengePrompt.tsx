import { Image, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { AudioContent } from '../renderers/AudioContent';

type MediaValue = { text?: string | null; title?: string | null; imageUrl?: string | null; audioUrl?: string | null } | string | null | undefined;
type Props = {
 title?: MediaValue;
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
export function ChallengePrompt({title,prompt,titleImageUrl,titleAudioUrl,imageUrl,audioUrl}:Props) {
 const heading = textValue(title);
 const description = textValue(prompt);
 const picture = titleImageUrl ?? imageUrl ?? imageValue(title) ?? imageValue(prompt);
 const audio = titleAudioUrl ?? audioUrl ?? audioValue(title) ?? audioValue(prompt);
 if (!heading && !description && !picture && !audio) return null;
 return <View style={{gap:12,paddingVertical:12,paddingHorizontal:4}}>
  {!!heading && <AppText variant="title" weight="700" style={{textAlign:'right',color:'#30234F'}}>{heading}</AppText>}
  {!!description && description!==heading && <AppText tone="muted" style={{textAlign:'right'}}>{description}</AppText>}
  {!!picture && <View style={{borderRadius:18,overflow:'hidden',backgroundColor:'#FFFFFF',padding:8,
   borderWidth:1,borderColor:'#EEE5F5'}}>
   <Image source={{uri:picture}} resizeMode="contain" style={{width:'100%',height:210}} accessibilityLabel="تصویر سؤال"/>
  </View>}
  {!!audio && <View style={{padding:12,borderRadius:18,backgroundColor:'#F0E9FC',borderWidth:1,borderColor:'#E1D4F3'}}>
   <AppText weight="700" style={{color:'#5B3993',textAlign:'right',fontSize:12,marginBottom:8}}>🔊 گوش کن</AppText>
   <AudioContent key={audio} uri={audio} completed={false} onFinish={()=>{}}/>
  </View>}
 </View>;
}
