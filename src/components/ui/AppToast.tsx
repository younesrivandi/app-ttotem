import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastKind = 'success' | 'error' | 'info';
type ToastOptions = { duration?: number; kind?: ToastKind };
type ToastContextValue = { show: (message: string, options?: ToastOptions) => void; hide: () => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; kind: ToastKind; id: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const hide = useCallback(() => {
    clear();
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 8, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) setToast(null); });
  }, [clear, opacity, translateY]);
  const show = useCallback((message: string, options: ToastOptions = {}) => {
    if (!message.trim()) return;
    clear();
    opacity.stopAnimation();
    translateY.stopAnimation();
    opacity.setValue(0);
    translateY.setValue(12);
    setToast({ message, kind: options.kind ?? 'info', id: ++counter.current });
    AccessibilityInfo.announceForAccessibility(message);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 190, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 220, mass: 0.8, useNativeDriver: true }),
    ]).start();
    timer.current = setTimeout(hide, Math.max(1000, options.duration ?? 2800));
  }, [clear, hide, opacity, translateY]);
  useEffect(() => () => { clear(); opacity.stopAnimation(); translateY.stopAnimation(); }, [clear, opacity, translateY]);
  const palette = toast?.kind === 'success'
    ? { accent: '#16835B', icon: '✓', surface: '#F1FBF5', border: '#C6EAD6' }
    : toast?.kind === 'error'
      ? { accent: '#C13F52', icon: '!', surface: '#FFF5F5', border: '#F5D4D9' }
      : { accent: '#7153AD', icon: 'i', surface: '#F7F3FF', border: '#E4D8F5' };
  return <ToastContext.Provider value={{ show, hide }}>
    {children}
    {toast && <View pointerEvents="none" style={{
      position: 'absolute', left: 20, right: 20, bottom: Math.max(insets.bottom, 12) + 30,
      alignItems: 'center', zIndex: 9999, elevation: 30,
    }}>
      <Animated.View accessibilityRole="alert" style={{
        opacity, transform: [{ translateY }],
        maxWidth: 400, backgroundColor: palette.surface,
        borderColor: palette.border, borderWidth: 1, borderRadius: 18,
        flexDirection: 'row-reverse', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 11, gap: 10,
        shadowColor: '#372A46', shadowOpacity: 0.13, shadowRadius: 16,
        shadowOffset: { width: 0, height: 5 }, elevation: 7,
      }}>
        <View style={{
          width: 28, height: 28, borderRadius: 14, backgroundColor: palette.accent,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700', textAlign: 'center' }}>
            {palette.icon}
          </Text>
        </View>
        <Text style={{ color: '#30283B', fontSize: 14, lineHeight: 23,
          fontWeight: '600', writingDirection: 'rtl', textAlign: 'right',
          flexShrink: 1 }}>{toast.message}</Text>
      </Animated.View>
    </View>}
  </ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
