import {useMemo} from 'react';
import {Pressable,View} from 'react-native';
import {Gesture,GestureDetector} from 'react-native-gesture-handler';
import Animated,{useAnimatedStyle,useSharedValue,withSpring,runOnJS} from 'react-native-reanimated';
import {AppText} from '@/components/ui/AppText';
import {useAppTheme} from '@/theme/ThemeProvider';
import {ItemLabel} from './shared';

const ROW_HEIGHT=92;
const SLOT_HEIGHT=100;
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

type Props={items:readonly unknown[];order:readonly number[];onMove:(from:number,to:number)=>void;disabled?:boolean};
type SortableRowProps={value:unknown;position:number;count:number;disabled:boolean;onMove:(from:number,to:number)=>void};

/** Drag handle with UI-thread animations. Accessible up/down controls are retained for keyboard and screen readers. */
function SortableRow({value,position,count,disabled,onMove}:SortableRowProps){
 const {colors}=useAppTheme();
 const offset=useSharedValue(0);
 const dragging=useSharedValue(false);
 const gesture=useMemo(()=>Gesture.Pan()
  .enabled(!disabled)
  .minDistance(6)
  .onBegin(()=>{dragging.value=true;})
  .onUpdate(event=>{offset.value=event.translationY;})
  .onEnd(event=>{
   const move=Math.round(event.translationY/SLOT_HEIGHT);
   const destination=clamp(position+move,0,count-1);
   if(destination!==position){runOnJS(onMove)(position,destination);}
  })
  .onFinalize(()=>{offset.value=withSpring(0);dragging.value=false;}),[disabled,position,count,onMove,offset,dragging]);
 const animatedStyle=useAnimatedStyle(()=>({transform:[{translateY:offset.value}],zIndex:dragging.value?10:0,elevation:dragging.value?7:0,opacity:dragging.value?0.9:1}));
 return <Animated.View style={[{height:ROW_HEIGHT,backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:12,padding:10,flexDirection:'row-reverse',alignItems:'center',gap:8},animatedStyle]}>
  <GestureDetector gesture={gesture}><Animated.View accessible accessibilityRole="adjustable" accessibilityLabel={`جابجایی گزینه ${position+1} با کشیدن`} style={{padding:12,minWidth:42,alignItems:'center',justifyContent:'center'}}><AppText>☰</AppText></Animated.View></GestureDetector>
  <AppText>{position+1}.</AppText>
  <ItemLabel value={value}/>
  <View style={{gap:1}}><Pressable accessibilityRole="button" accessibilityLabel={`انتقال گزینه ${position+1} به بالا`} disabled={disabled||position===0} onPress={()=>onMove(position,position-1)} style={{padding:7,opacity:disabled||position===0?0.3:1}}><AppText>↑</AppText></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`انتقال گزینه ${position+1} به پایین`} disabled={disabled||position===count-1} onPress={()=>onMove(position,position+1)} style={{padding:7,opacity:disabled||position===count-1?0.3:1}}><AppText>↓</AppText></Pressable></View>
 </Animated.View>;
}
export function SortingRenderer({items,order,onMove,disabled=false}:Props){
 return <View style={{gap:SLOT_HEIGHT-ROW_HEIGHT}}>{order.map((index,pos)=><SortableRow key={index} value={items[index]} position={pos} count={order.length} onMove={onMove} disabled={disabled}/>)}</View>;
}
