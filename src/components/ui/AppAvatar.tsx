import { Image, View, type ImageSourcePropType } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
import { AppText } from './AppText';
type Props = {name: string; uri?: string; source?: ImageSourcePropType; size?: number};
export function AppAvatar({name,uri,source,size=48}: Props) {
 const {colors}=useAppTheme();const src=source??(uri?{uri}:undefined);
 return <View accessibilityLabel={`تصویر ${name}`} style={{height:size,width:size,borderRadius:size/2,overflow:'hidden',alignItems:'center',justifyContent:'center',backgroundColor:colors.accentSoft}}>
  {src ? <Image source={src} resizeMode="cover" style={{height:size,width:size}} accessibilityLabel={name}/> : <AppText weight="700" style={{fontSize:size*.34,color:colors.primary}}>{Array.from(name.trim())[0]??'؟'}</AppText>}
 </View>;
}
