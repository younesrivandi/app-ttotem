import { useState } from 'react';
import { Image, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
import { AppText } from './AppText';
type Props = {source: ImageSourcePropType; alt: string; height?: number; style?: StyleProp<ViewStyle>};
export function RemoteImage({source,alt,height=160,style}: Props) {
 const {colors}=useAppTheme();const [failed,setFailed]=useState(false);
 return <View style={[{height,width:'100%',borderRadius:12,overflow:'hidden',backgroundColor:colors.surfaceMuted,alignItems:'center',justifyContent:'center'},style]}>
  {failed?<AppText tone="muted" variant="caption">تصویر در دسترس نیست</AppText>:<Image source={source} accessibilityLabel={alt} resizeMode="cover" onError={()=>setFailed(true)} style={{width:'100%',height:'100%'}}/>}
 </View>;
}
