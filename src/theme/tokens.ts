export const palette = {
  teal: { 50: '#EAF6F4', 100: '#D3EDE9', 500: '#137B78', 600: '#0C6968', 700: '#075553' },
  neutral: { 0: '#FFFFFF', 50: '#F8F9F8', 100: '#F0F2F1', 200: '#DAE0DD', 400: '#87938F', 600: '#52615D', 800: '#24322F', 950: '#14201E' },
  amber: '#E3A542', red: '#C94150', blue: '#3A70C7',
} as const;
export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radii = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 } as const;
export const typeScale = {
  caption: { fontSize: 12, lineHeight: 20 },
  body: { fontSize: 15, lineHeight: 26 },
  subtitle: { fontSize: 18, lineHeight: 30 },
  title: { fontSize: 26, lineHeight: 40 },
  hero: { fontSize: 32, lineHeight: 48 },
} as const;
export const breakpoints = { tablet: 720, desktop: 1080 } as const;
export type ThemeMode = 'system' | 'light' | 'dark';
export type ThemeColors = {
  background: string; surface: string; surfaceMuted: string; text: string; textMuted: string;
  border: string; primary: string; primaryContrast: string; accentSoft: string; error: string;
};
export const themes: Record<'light' | 'dark', ThemeColors> = {
  light: {background:'#F6F8F6',surface:'#FFFFFF',surfaceMuted:'#ECF2EF',text:'#192E2A',textMuted:'#586A64',border:'#D4E1DB',primary:'#0C6968',primaryContrast:'#FFFFFF',accentSoft:'#D3EDE9',error:'#B72D3D'},
  dark: {background:'#101A18',surface:'#1A2824',surfaceMuted:'#263832',text:'#EFF7F3',textMuted:'#B2C7BC',border:'#3A5148',primary:'#7AD7C8',primaryContrast:'#102824',accentSoft:'#294C46',error:'#FF9DA7'},
};
