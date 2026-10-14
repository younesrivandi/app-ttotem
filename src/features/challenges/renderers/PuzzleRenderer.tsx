import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, PanResponder, View, type View as NativeView } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import type { PuzzlePiece, PuzzlePlacement } from '../engine';

type Props = {
 pieces: readonly PuzzlePiece[];
 boardImageUrl?: string;
 placements: Record<string, PuzzlePlacement>;
 disabled: boolean;
 onDrop: (pieceId: string, x: number, y: number) => void;
};

function DraggablePiece({ piece, disabled, onDrop }: {
 piece: PuzzlePiece; disabled: boolean;
 onDrop: (id: string, x: number, y: number) => void;
}) {
 const [dragging, setDragging] = useState(false);
 const offset = useRef(new Animated.ValueXY({x:0,y:0})).current;
 const disabledRef = useRef(disabled);
 disabledRef.current = disabled;
 const dropRef = useRef(onDrop);
 dropRef.current = onDrop;
 const responder = useMemo(() => PanResponder.create({
  onStartShouldSetPanResponder: () => !disabledRef.current,
  onMoveShouldSetPanResponder: () => !disabledRef.current,
  onPanResponderTerminationRequest: () => false,
  onPanResponderGrant: () => {offset.setValue({x:0,y:0});setDragging(true);},
  onPanResponderMove: (_event, gesture) => offset.setValue({x:gesture.dx,y:gesture.dy}),
  onPanResponderRelease: (_event, gesture) => {
   setDragging(false);
   offset.setValue({x:0,y:0});
   if (!disabledRef.current) dropRef.current(piece.id, gesture.moveX, gesture.moveY);
  },
  onPanResponderTerminate: () => {setDragging(false);offset.setValue({x:0,y:0});},
 }), [piece.id]);
 return <Animated.View {...responder.panHandlers} style={{
  width: 82, height: 82, borderRadius: 14,
  borderWidth: dragging ? 2 : 1, borderColor: dragging ? '#9B5BE6' : '#E7DDF3',
  backgroundColor: dragging ? '#EEE2FF' : '#FFFFFF',
  alignItems: 'center', justifyContent: 'center', opacity: dragging ? 0.85 : 1,
  zIndex: dragging ? 100 : 0,elevation: dragging ? 12 : 0,
  transform: offset.getTranslateTransform(),
 }}>
  <Image source={{ uri: piece.imageUrl }} resizeMode="contain" style={{ width: 70, height: 70 }} />
 </Animated.View>;
}

export function PuzzleRenderer({ pieces, boardImageUrl, placements, disabled, onDrop }: Props) {
 const boardRef = useRef<NativeView>(null);
 const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
 const [boardAspectRatio, setBoardAspectRatio] = useState(1);
 useEffect(() => {
  setBoardAspectRatio(1);
  if (!boardImageUrl) return;
  let active = true;
  Image.getSize(boardImageUrl, (width, height) => {
   if (active && width > 0 && height > 0) setBoardAspectRatio(width / height);
  }, () => {});
  return () => { active = false; };
 }, [boardImageUrl]);
 const placed = Object.values(placements);
 const available = pieces.filter(piece => !placements[piece.id]);
 const sendDrop = (pieceId: string, pageX: number, pageY: number) => {
  boardRef.current?.measureInWindow((left, top, width, height) => {
   if (!width || !height) return;
   // Legacy sends normalized board-relative coordinates, clamped to the board.
   const x = Math.max(0, Math.min(1, (pageX - left) / width));
   const y = Math.max(0, Math.min(1, (pageY - top) / height));
   onDrop(pieceId, x, y);
  });
 };
 return <View style={{ gap: 16 }}>
  <View ref={boardRef} collapsable={false} onLayout={event => setBoardSize({
   width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height,
  })} style={{
   width: '100%', aspectRatio: boardAspectRatio,
   alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 24,
   borderWidth: 1, borderColor: '#E7DDF3', overflow: 'hidden',
  }}>
   {!!boardImageUrl && <Image source={{ uri: boardImageUrl }} resizeMode="contain"
    style={{ width: '100%', height: '100%' }} />}
   {placed.map(placement => {
    const piece = pieces.find(item => item.id === placement.pieceId);
    if (!piece) return null;
    const width = placement.width * boardSize.width;
    const height = placement.height * boardSize.height;
    return <Image key={placement.pieceId} source={{ uri: piece.imageUrl }} resizeMode="contain"
     style={{ position: 'absolute', left: placement.x * boardSize.width - width / 2,
      top: placement.y * boardSize.height - height / 2,
      width, height }} />;
   })}
  </View>
  <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
   {available.map(piece => <DraggablePiece key={piece.id} piece={piece}
    disabled={disabled} onDrop={sendDrop} />)}
  </View>
  <AppText style={{ color: '#8B79A6', fontSize: 12, textAlign: 'center' }}>
   قطعه‌ها را روی جای درستشان بکش و رها کن
  </AppText>
  {disabled && <AppText style={{ textAlign: 'center', color: '#7051A4' }}>در حال بررسی قطعه…</AppText>}
 </View>;
}
