import type { PropsWithChildren } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { useResponsive } from '@/theme/useResponsive';

type Props = PropsWithChildren<{scroll?: boolean; contentStyle?: StyleProp<ViewStyle>}>
export function AppScreen({children, scroll = true, contentStyle}: Props) {
  const {colors} = useAppTheme();
  const {size} = useResponsive();
  const containerStyle: ViewStyle = {
    width:'100%', maxWidth: 880, alignSelf:'center',
    paddingHorizontal: size === 'phone' ? spacing.md : spacing.xl,
    paddingTop: spacing.lg, paddingBottom: spacing.xxl,
  };
  return (
    <SafeAreaView edges={['top','bottom','left','right']} style={{ flex:1, backgroundColor: colors.background }}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[containerStyle, contentStyle]}>{children}</ScrollView>
        : <View style={[{flex:1},containerStyle,contentStyle]}>{children}</View>}
    </SafeAreaView>
  );
}
