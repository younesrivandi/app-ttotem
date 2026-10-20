import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Pressable, Text, View } from 'react-native';
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
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const hide = useCallback(() => {
    clear();
    Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [clear, opacity]);
  const show = useCallback((message: string, options: ToastOptions = {}) => {
    if (!message.trim()) return;
    clear();
    opacity.stopAnimation();
    opacity.setValue(0);
    setToast({ message, kind: options.kind ?? 'info', id: ++counter.current });
    AccessibilityInfo.announceForAccessibility(message);
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    timer.current = setTimeout(hide, Math.max(1000, options.duration ?? 2800));
  }, [clear, hide, opacity]);
  useEffect(() => () => { clear(); opacity.stopAnimation(); }, [clear, opacity]);
  const colors = toast?.kind === 'success'
    ? { bg: '#176A42', border: '#B9F5D3' }
    : toast?.kind === 'error'
      ? { bg: '#9B2940', border: '#FFD2DB' }
      : { bg: '#38264F', border: '#E7D6FF' };
  return <ToastContext.Provider value={{ show, hide }}>
    {children}
    {toast && <View pointerEvents="box-none" style={{
      position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 12) + 24,
      alignItems: 'center', zIndex: 9999, elevation: 30,
    }}>
      <Animated.View style={{ opacity, maxWidth: 520, width: '100%', backgroundColor: colors.bg,
        borderColor: colors.border, borderWidth: 1, borderRadius: 16,
        shadowColor: '#1E1627', shadowOpacity: 0.25, shadowRadius: 12, elevation: 20 }}>
        <Pressable accessibilityRole="alert" onPress={hide} style={{ paddingHorizontal: 20, paddingVertical: 14 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center',
            writingDirection: 'rtl' }}>{toast.message}</Text>
        </Pressable>
      </Animated.View>
    </View>}
  </ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
