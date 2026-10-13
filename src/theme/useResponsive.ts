import { useWindowDimensions } from 'react-native';
import { breakpoints } from './tokens';
export function useResponsive() {
  const { width, height, fontScale } = useWindowDimensions();
  return {
    width, height, fontScale,
    size: width >= breakpoints.desktop ? 'desktop' as const : width >= breakpoints.tablet ? 'tablet' as const : 'phone' as const,
    contentWidth: Math.min(Math.max(width - 32, 0), 880),
  };
}
