import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';
import { AppText } from './AppText';
type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Props = Omit<PressableProps, 'children'> & { title: string; variant?: Variant; size?: 'sm' | 'md' | 'lg'; loading?: boolean; fullWidth?: boolean };
export function AppButton({title,variant='primary',size='md',loading=false,disabled=false,fullWidth=false,style,...rest}: Props) {
 const {colors}=useAppTheme(); const filled=variant==='primary'||variant==='danger';
 const foreground=filled?colors.primaryContrast:colors.primary;
 const background=variant==='primary'?colors.primary:variant==='danger'?colors.error:variant==='secondary'?colors.surfaceMuted:'transparent';
 const height=size==='sm'?40:size==='lg'?56:48;
 return <Pressable {...rest} accessibilityRole="button" accessibilityLabel={rest.accessibilityLabel??title}
  accessibilityState={{disabled:disabled||loading,busy:loading}} disabled={disabled||loading}
  style={(state)=>{const custom=typeof style==='function'?style(state):style;return [{minHeight:height,minWidth:44,alignSelf:fullWidth?'stretch':'flex-start',opacity:disabled?0.45:state.pressed?0.75:1,backgroundColor:background,borderRadius:radii.md,borderWidth:variant==='outline'?1:0,borderColor:colors.border,paddingHorizontal:spacing.md,alignItems:'center',justifyContent:'center'},custom]}}>
  <View style={{flexDirection:'row-reverse',alignItems:'center',gap:spacing.xs}}>
   {loading && <ActivityIndicator size="small" color={foreground}/>}
   <AppText weight="600" style={{color:foreground,textAlign:'center'}}>{title}</AppText>
  </View>
 </Pressable>;
}
