import type { ComponentProps } from 'react';
import { Text, type TextStyle } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
import { typeScale } from '@/theme/tokens';

type Variant = keyof typeof typeScale;
type Props = ComponentProps<typeof Text> & { variant?: Variant; tone?: 'default' | 'muted' | 'primary' | 'error'; weight?: TextStyle['fontWeight'] };
export function AppText({ variant='body', tone='default', weight, style, children, ...rest }: Props) {
  const { colors } = useAppTheme();
  const color = tone==='muted' ? colors.textMuted : tone==='primary' ? colors.primary : tone==='error' ? colors.error : colors.text;
  return <Text {...rest} style={[typeScale[variant], {color, textAlign:'right', writingDirection:'rtl', ...(weight ? {fontWeight:weight} : {})}, style]}>{children}</Text>;
}
