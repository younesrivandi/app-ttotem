import { useMemo, useRef, useState } from 'react';
import { Image, PanResponder, View, type GestureResponderEvent } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import type { Point, Stroke } from '../engine';
import { AppButton } from '@/components/ui/AppButton';
import { useAppTheme } from '@/theme/ThemeProvider';

const MAX_POINTS = 4000;
const MIN_DISTANCE_SQUARED = 2.25;
type Props = {
 imageUrl?: string;
 strokes: readonly Stroke[];
 onChange: (value: Stroke[]) => void;
 onStrokeEnd?: (value: Stroke[]) => void;
 disabled?: boolean;
};

export function PathRenderer({ imageUrl, strokes, onChange, onStrokeEnd, disabled = false }: Props) {
 const { colors } = useAppTheme();
 const active = useRef<Point[]>([]);
 const [preview, setPreview] = useState<Point[]>([]);
 const bounds = useRef({ width: 0, height: 280 });
 const saved = useRef(strokes);
 saved.current = strokes;
 const change = useRef(onChange);
 change.current = onChange;
 const finish = useRef(onStrokeEnd);
 finish.current = onStrokeEnd;
 const disabledRef = useRef(disabled);
 disabledRef.current = disabled;
 const lastPaint = useRef(0);

 const readPoint = (event: GestureResponderEvent): Point | null => {
  const { locationX, locationY } = event.nativeEvent;
  if (!Number.isFinite(locationX) || !Number.isFinite(locationY)) return null;
  const { width, height } = bounds.current;
  if (width <= 0 || height <= 0) return null;
  return {
   x: Math.max(0, Math.min(width, locationX)),
   y: Math.max(0, Math.min(height, locationY)),
  };
 };
 const reset = () => { active.current = []; setPreview([]); };

 const responder = useMemo(() => PanResponder.create({
  onStartShouldSetPanResponder: () => !disabledRef.current,
  onMoveShouldSetPanResponder: () => !disabledRef.current,
  onPanResponderTerminationRequest: () => false,
  onPanResponderGrant: event => {
   const point = readPoint(event);
   if (!point) return;
   active.current = [point];
   setPreview([point]);
  },
  onPanResponderMove: event => {
   if (disabledRef.current || active.current.length >= MAX_POINTS) return;
   const point = readPoint(event);
   if (!point) return;
   const last = active.current[active.current.length - 1];
   if (last && (point.x - last.x) ** 2 + (point.y - last.y) ** 2 < MIN_DISTANCE_SQUARED) return;
   active.current.push(point);
   const now = Date.now();
   if (now - lastPaint.current >= 16) {
    lastPaint.current = now;
    setPreview([...active.current]);
   }
  },
  onPanResponderRelease: () => {
   const points = active.current;
   if (points.length >= 2 && !disabledRef.current) {
    const next = [...saved.current, { points: [...points] }];
    // A completed stroke is handled exactly once; the parent owns validation.
    if (finish.current) finish.current(next);
    else change.current(next);
   }
   reset();
  },
  onPanResponderTerminate: reset,
 }), []);

 return <View style={{ gap: 12 }}>
  <View style={{
   height: 280, borderColor: colors.border, borderWidth: 1, borderRadius: 12,
   overflow: 'hidden', backgroundColor: colors.surface,
  }}>
   {imageUrl ? <Image pointerEvents="none" source={{ uri: imageUrl }} resizeMode="contain"
    style={{ width: '100%', height: '100%', position: 'absolute' }} /> : null}
   <View style={{ flex: 1, touchAction: 'none' }}
    onLayout={event => {
     const { width, height } = event.nativeEvent.layout;
     bounds.current = { width, height };
    }} {...responder.panHandlers}>
    <Svg width="100%" height="100%" pointerEvents="none">
     {[...strokes.map(stroke => stroke.points), preview].map((points, index) =>
      points.length > 1
       ? <Polyline key={index} points={points.map(point => `${point.x},${point.y}`).join(' ')}
        fill="none" stroke={colors.primary} strokeWidth={4}
        strokeLinecap="round" strokeLinejoin="round" />
       : null)}
    </Svg>
   </View>
  </View>
  <AppButton title="پاک کردن مسیر" variant="secondary" onPress={() => onChange([])}
   disabled={disabled || strokes.length === 0} />
 </View>;
}
