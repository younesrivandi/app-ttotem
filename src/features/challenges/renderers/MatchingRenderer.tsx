import {useMemo,useRef,useState} from 'react';
import {PanResponder,Pressable,View,type LayoutChangeEvent} from 'react-native';
import Svg,{Line} from 'react-native-svg';
import type {Match} from '../engine';
import {AppText} from '@/components/ui/AppText';
import {ItemLabel} from './shared';
import {useAppTheme} from '@/theme/ThemeProvider';
type Rect={x:number;y:number;width:number;height:number};
/** Native PanResponder handles dragging; tapping source then target is a keyboard/screen-reader alternative. */
export function MatchingRenderer({sources,targets,matches,onConnect,disabled=false}:{sources:readonly unknown[];targets:readonly unknown[];matches:readonly Match[];onConnect:(s:number,t:number)=>void;disabled?:boolean}){
 const {colors}=useAppTheme();const [selected,setSelected]=useState<number|null>(null);const [rects,setRects]=useState<Record<string,Rect>>({});const [drag,setDrag]=useState<{source:number;x:number;y:number}|null>(null);const ref=useRef<{rects:Record<string,Rect>;disabled:boolean;onConnect:(s:number,t:number)=>void}>({rects,disabled,onConnect});ref.current={rects,disabled,onConnect};
 const update=(key:string)=>(e:LayoutChangeEvent)=>{const {x,y,width,height}=e.nativeEvent.layout;setRects(old=>({...old,[key]:{x,y,width,height}}));};
 // All coordinates are relative to the same board container; columns have measured offsets.
 const [columns,setColumns]=useState<Record<string,Rect>>({});const colsRef=useRef(columns);colsRef.current=columns;
 const center=(col:string,key:string)=>{const c=columns[col],r=rects[key];return c&&r?{x:c.x+r.x+r.width/2,y:c.y+r.y+r.height/2}:null;};
 const respond=useMemo(()=>PanResponder.create({onStartShouldSetPanResponder:()=>false,onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>7||Math.abs(g.dy)>7,onPanResponderMove:(_,g)=>{const s=selectedRef.current;if(s===null)return;const c=colsRef.current.left,r=ref.current.rects[`s${s}`];if(c&&r)setDrag({source:s,x:c.x+r.x+r.width/2+g.dx,y:c.y+r.y+r.height/2+g.dy});},onPanResponderRelease:(_,g)=>{const s=selectedRef.current;const left=colsRef.current.left;const right=colsRef.current.right;if(s!==null&&left&&right&&!ref.current.disabled){const start=ref.current.rects[`s${s}`];if(start){const x=left.x+start.x+start.width/2+g.dx,y=left.y+start.y+start.height/2+g.dy;for(let i=0;i<targetsLength.current;i++){const r=ref.current.rects[`t${i}`];if(r&&x>=right.x+r.x&&x<=right.x+r.x+r.width&&y>=right.y+r.y&&y<=right.y+r.y+r.height){ref.current.onConnect(s,i);break;}}}}setDrag(null);selectedRef.current=null;}}),[]);
 const selectedRef=useRef<number|null>(null);const targetsLength=useRef(targets.length);targetsLength.current=targets.length;
 const chooseSource=(i:number)=>{selectedRef.current=i;setSelected(i)};
 const chooseTarget=(i:number)=>{if(selected!==null&&!disabled){onConnect(selected,i);selectedRef.current=null;setSelected(null);}};
 return <View style={{minHeight:Math.max(sources.length,targets.length)*78+12}} {...respond.panHandlers}>
 <View style={{flexDirection:'row-reverse',gap:16}}>
 <View onLayout={e=>setColumns(c=>({...c,left:e.nativeEvent.layout}))} style={{flex:1,gap:8}}>{sources.map((v,i)=><Pressable key={i} onLayout={update(`s${i}`)} onPress={()=>chooseSource(i)} disabled={disabled} accessibilityRole="button" accessibilityLabel={`انتخاب مبدأ ${i+1}`} accessibilityState={{selected:selected===i}} style={{borderWidth:selected===i?2:1,borderColor:selected===i?colors.primary:colors.border,borderRadius:10,minHeight:70,padding:8,backgroundColor:colors.surface}}><ItemLabel value={v}/></Pressable>)}</View>
 <View onLayout={e=>setColumns(c=>({...c,right:e.nativeEvent.layout}))} style={{flex:1,gap:8}}>{targets.map((v,i)=><Pressable key={i} onLayout={update(`t${i}`)} onPress={()=>chooseTarget(i)} disabled={disabled} accessibilityRole="button" accessibilityLabel={`اتصال به مقصد ${i+1}`} style={{borderWidth:1,borderColor:colors.border,borderRadius:10,minHeight:70,padding:8,backgroundColor:colors.surface}}><ItemLabel value={v}/></Pressable>)}</View>
 </View>
 <Svg pointerEvents="none" width="100%" height="100%" style={{position:'absolute',left:0,top:0}}>{matches.map(m=>{const a=center('left',`s${m.sourceIndex}`),b=center('right',`t${m.targetIndex}`);return a&&b?<Line key={m.sourceIndex} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors.primary} strokeWidth={3}/>:null})}{drag?<Line x1={center('left',`s${drag.source}`)?.x??drag.x} y1={center('left',`s${drag.source}`)?.y??drag.y} x2={drag.x} y2={drag.y} stroke={colors.primary} strokeWidth={2} strokeDasharray="5 4"/>:null}</Svg>
 </View>;
 function setBoard(_v:{width:number;height:number}){/* dimensions are inferred by SVG */}
}
