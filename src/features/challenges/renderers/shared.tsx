import { Image, Pressable, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { AppText } from '@/components/ui/AppText';

export type Item = {text?:string;label?:string;title?:string;imageUrl?:string;audioUrl?:string};
export function objectItem(v:unknown):Item {
 if(typeof v==='string'||typeof v==='number')return {text:String(v)};
 if(typeof v==='object'&&v!==null)return v as Item;
 return {text:'—'};
}
function AudioOption({uri}:{uri:string}){
 const player=useAudioPlayer(uri);
 const status=useAudioPlayerStatus(player);
 return <Pressable accessibilityRole="button" accessibilityLabel={status.playing?'مکث صدای گزینه':'پخش صدای گزینه'}
  disabled={!status.isLoaded}
  onPress={event=>{event.stopPropagation();void (async()=>{try{if(status.playing){player.pause();return;}if(status.didJustFinish||(status.duration>0&&status.currentTime>=status.duration-0.15))await player.seekTo(0);player.play();}catch{}})();}}
  style={{paddingHorizontal:10,paddingVertical:8,borderRadius:12,backgroundColor:'#F0E6FF',
   borderWidth:1,borderColor:'#DCC7F7',opacity:status.isLoaded?1:0.5}}>
  <AppText weight="700" style={{color:'#6842A2',fontSize:12}}>{status.playing?'⏸ مکث':'🔊 پخش صدا'}</AppText>
 </Pressable>;
}
export function ItemLabel({value,centered=false}:{value:unknown;centered?:boolean}){
 const v=objectItem(value);
 const label=v.text??v.label??v.title;
 return <View style={{flexDirection:'row-reverse',alignItems:'center',gap:10,flex:1,flexWrap:'wrap',
  ...(centered?{width:'100%' as const,justifyContent:'center' as const,alignContent:'center' as const}: {})}}>
  {!!v.imageUrl&&<Image source={{uri:v.imageUrl}} style={{width:68,height:68,borderRadius:8}} resizeMode="contain"/>}
  {!!label&&<AppText style={{flexShrink:1,...(centered?{textAlign:'center' as const}: {})}}>{label}</AppText>}
  {!!v.audioUrl&&<AudioOption key={v.audioUrl} uri={v.audioUrl}/>}
  {!label&&!v.imageUrl&&!v.audioUrl&&<AppText tone="muted">گزینه</AppText>}
 </View>;
}
