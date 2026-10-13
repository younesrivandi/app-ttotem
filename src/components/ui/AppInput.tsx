import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radii, spacing, typeScale } from '@/theme/tokens';
import { AppText } from './AppText';
type Props = TextInputProps & { label: string; error?: string; helperText?: string; required?: boolean };
export function AppInput({label,error,helperText,required=false,style,onFocus,onBlur,...rest}: Props) {
 const {colors}=useAppTheme();const [focused,setFocused]=useState(false);
 return <View style={{gap:spacing.xs}}>
  <AppText weight="600">{label}{required?' *':''}</AppText>
  <TextInput {...rest} accessibilityLabel={label} accessibilityHint={error??helperText} accessibilityState={{disabled:!rest.editable && rest.editable!==undefined}}
   placeholderTextColor={colors.textMuted} onFocus={(e)=>{setFocused(true);onFocus?.(e)}} onBlur={(e)=>{setFocused(false);onBlur?.(e)}}
   style={[{minHeight:48,borderWidth:1,borderColor:error?colors.error:focused?colors.primary:colors.border,borderRadius:radii.md,backgroundColor:colors.surface,color:colors.text,paddingHorizontal:spacing.md,paddingVertical:spacing.sm,textAlign:'right',writingDirection:'rtl',...typeScale.body},style]}/>
  {!!error && <AppText variant="caption" tone="error" accessibilityRole="alert">{error}</AppText>}
  {!error&&!!helperText&&<AppText variant="caption" tone="muted">{helperText}</AppText>}
 </View>;
}
