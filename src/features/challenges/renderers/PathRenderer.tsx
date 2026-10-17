import { useMemo, useRef, useState } from 'react';
import { Image, PanResponder, Pressable, View, type GestureResponderEvent } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import type { Point, Stroke } from '../engine';

import { useAppTheme } from '@/theme/ThemeProvider';

const MAX_POINTS = 4000;
const MIN_DISTANCE_SQUARED = 0.002 ** 2;
type Props = {
 imageUrl?: string;
 strokes: readonly Stroke[];
 onChange: (value: Stroke[]) => void;
 onStrokeEnd?: (value: Stroke[]) => void;
 onDrawingChange?: (drawing: boolean) => void;
 /** Only shown after a failed network/backend request, not after a wrong answer. */
 showReset?: boolean;
 onReset?: () => void;
 disabled?: boolean;
};

export function PathRenderer({ imageUrl, strokes, onChange, onStrokeEnd, onDrawingChange, showReset=false, onReset, disabled = false }: Props) {
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
 const drawingChange = useRef(onDrawingChange);
 drawingChange.current = onDrawingChange;
 const disabledRef = useRef(disabled);
 disabledRef.current = disabled;
 const lastPaint = useRef(0);
 const startPoint = useRef<Point | null>(null);
 const [canvasSize, setCanvasSize] = useState({ width: 1, height: 280 });

 const responder = useMemo(() => {
 const readPoint = (event: GestureResponderEvent): Point | null => {
  const { locationX, locationY } = event.nativeEvent;
  if (!Number.isFinite(locationX) || !Number.isFinite(locationY)) return null;
  const { width, height } = bounds.current;
  if (width <= 0 || height <= 0) return null;
  return {
   x: Math.max(0, Math.min(1, locationX / width)),
   y: Math.max(0, Math.min(1, locationY / height)),
  };
 };
 const reset = () => { active.current = []; startPoint.current = null; setPreview([]); drawingChange.current?.(false); };

 return PanResponder.create({
  onStartShouldSetPanResponder: () => !disabledRef.current,
  onMoveShouldSetPanResponder: () => !disabledRef.current,
  onPanResponderTerminationRequest: () => false,
  onPanResponderGrant: event => {
   const point = readPoint(event);
   if (!point) return;
   startPoint.current = point;
   active.current = [point];
   drawingChange.current?.(true);
   setPreview([point]);
  },
  onPanResponderMove: (_event, gesture) => {
   if (disabledRef.current || active.current.length >= MAX_POINTS) return;
   const start = startPoint.current;
   const { width, height } = bounds.current;
   if (!start || width <= 0 || height <= 0) return;
   const point = {
    x: Math.max(0, Math.min(1, start.x + gesture.dx / width)),
    y: Math.max(0, Math.min(1, start.y + gesture.dy / height)),
   };
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
    // Preserve the full collection of strokes until a quiet-period check.
    saved.current = next;
    if (finish.current) finish.current(next);
    else change.current(next);
   }
   reset();
  },
  onPanResponderTerminate: reset,
 });
 }, []);

 return <View style={{ gap: 12 }}>
  <View style={{
   height: 280, borderColor: colors.border, borderWidth: 1, borderRadius: 12,
   overflow: 'hidden', backgroundColor: colors.surface,
  }}>
   {imageUrl ? <Image source={{ uri: imageUrl }} resizeMode="contain"
    style={{ width: '100%', height: '100%', position: 'absolute' }} /> : null}
   <View style={{ flex: 1 }}
    onLayout={event => {
     const { width, height } = event.nativeEvent.layout;
     bounds.current = { width, height };
     setCanvasSize({ width, height });
    }} {...responder.panHandlers}>
    <Svg width="100%" height="100%" pointerEvents="none">
     {[...strokes.map(stroke => stroke.points), preview].map((points, index) =>
      points.length > 1
       ? <Polyline key={index} points={points.map(point => `${point.x * canvasSize.width},${point.y * canvasSize.height}`).join(' ')}
        fill="none" stroke="#4A90E2" strokeWidth={14}
        strokeLinecap="round" strokeLinejoin="round" />
       : null)}
    </Svg>
   </View>
  </View>
  {showReset&&onReset&&!disabled?<Pressable
   accessibilityRole="button" accessibilityLabel="رسم دوباره مسیر"
   onPress={onReset}
   style={{width:42,height:42,alignSelf:'flex-end',borderRadius:21,
    backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,
    justifyContent:'center',alignItems:'center'}}>
   <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" fill="none"
     stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 3v5h5" fill="none" stroke={colors.primary}
     strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
   </Svg>
  </Pressable>:null}
 </View>;
}
