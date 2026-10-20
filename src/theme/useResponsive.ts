import { Platform, useWindowDimensions } from 'react-native';
import { breakpoints } from './tokens';
export function useResponsive() {
  const window = useWindowDimensions();
  const width = Platform.OS === 'web' ? Math.min(window.width, 425) : window.width;
  const { height, fontScale } = window;
  return {
    width, height, fontScale,
    size: width >= breakpoints.desktop ? 'desktop' as const : width >= breakpoints.tablet ? 'tablet' as const : 'phone' as const,
    contentWidth: Math.min(Math.max(width - 32, 0), Platform.OS === 'web' ? 425 : 880),
  };
}
