import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { themes, type ThemeColors, type ThemeMode } from './tokens';

type ThemeContextValue = { colors: ThemeColors; mode: ThemeMode; resolvedMode: 'light' | 'dark'; setMode: (next: ThemeMode) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const resolvedMode = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const value = useMemo(() => ({ colors: themes[resolvedMode], mode, resolvedMode, setMode }), [mode, resolvedMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used under AppThemeProvider');
  return value;
}
