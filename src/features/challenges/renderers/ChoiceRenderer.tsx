import {Pressable,View} from 'react-native';
import {AppText} from '@/components/ui/AppText';
import {useAppTheme} from '@/theme/ThemeProvider';
import {ItemLabel} from './shared';
export function ChoiceRenderer({options,selected,onSelect,disabled=false}:{options:readonly unknown[];selected:readonly number[];onSelect:(i:number)=>void;disabled?:boolean}){
 const {colors}=useAppTheme();return <View style={{gap:12}}>{options.map((option,i)=>{const active=selected.includes(i);return <Pressable key={i} accessibilityRole="checkbox" accessibilityState={{checked:active,disabled}} disabled={disabled} onPress={()=>onSelect(i)} style={{padding:14,minHeight:64,borderRadius:14,borderWidth:active?2:1,borderColor:active?colors.primary:colors.border,backgroundColor:colors.surface,flexDirection:'row-reverse',alignItems:'center',gap:10}}><AppText>{active?'☑':'□'}</AppText><ItemLabel value={option}/></Pressable>;})}</View>;
}
