import { View, type ViewProps } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';
export function AppCard({style,children,...rest}: ViewProps) {
 const {colors}=useAppTheme();return <View {...rest} style={[{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radii.lg,padding:spacing.md,gap:spacing.sm},style]}>{children}</View>;
}
