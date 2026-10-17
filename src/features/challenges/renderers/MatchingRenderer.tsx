import {useEffect,useMemo,useRef,useState} from 'react';
import {PanResponder,Pressable,View,type LayoutChangeEvent} from 'react-native';
import Svg,{Circle,Line} from 'react-native-svg';
import type {Match} from '../engine';
import {ItemLabel} from './shared';
import {useAppTheme} from '@/theme/ThemeProvider';

type Side='source'|'target';
type Rect={x:number;y:number;width:number;height:number};
type Selection={side:Side;index:number};
type Drag=Selection&{x:number;y:number};
type Props={
 sources:readonly unknown[];
 targets:readonly unknown[];
 matches:readonly Match[];
 onConnect:(sourceIndex:number,targetIndex:number)=>void;
 disabled?:boolean;
};
type TileProps={
 value:unknown;
 side:Side;
 index:number;
 selected:boolean;
 matched:boolean;
 disabled:boolean;
 onTap:(side:Side,index:number)=>void;
 onDragBegin:(side:Side,index:number)=>void;
 onDragMove:(pageX:number,pageY:number,dx:number,dy:number)=>void;
 onDragEnd:(pageX:number,pageY:number)=>void;
 onDragCancel:()=>void;
 onTouchBegin:()=>void;
 onLayout:(e:LayoutChangeEvent)=>void;
};

/** Keep native tap accessibility while claiming horizontal movement as a drag. */
function MatchTile(props:TileProps){
 const {colors}=useAppTheme();
 const latest=useRef(props);
 latest.current=props;
 const pan=useMemo(()=>PanResponder.create({
  onStartShouldSetPanResponder:()=>false,
  onMoveShouldSetPanResponderCapture:(_,g)=>
   !latest.current.disabled&&Math.abs(g.dx)>8&&Math.abs(g.dx)>Math.abs(g.dy)*0.65,
  onPanResponderGrant:()=>{
   const p=latest.current;
   if(!p.disabled)p.onDragBegin(p.side,p.index);
  },
  onPanResponderMove:(_,g)=>{
   if(!latest.current.disabled)latest.current.onDragMove(g.moveX,g.moveY,g.dx,g.dy);
  },
  onPanResponderRelease:(_,g)=>latest.current.onDragEnd(g.moveX,g.moveY),
  onPanResponderTerminate:()=>latest.current.onDragCancel(),
  onPanResponderTerminationRequest:()=>false,
 }),[]);
 return <View {...pan.panHandlers} onTouchStart={props.onTouchBegin} onLayout={props.onLayout}
  style={{width:'100%',maxWidth:220,aspectRatio:1}}>
  <Pressable accessibilityRole="button"
   accessibilityLabel={`${props.side==='source'?'آیتم سمت راست':'آیتم سمت چپ'} ${props.index+1}؛ برای اتصال لمس یا به سمت مقابل بکشید`}
   accessibilityState={{selected:props.selected,disabled:props.disabled}}
   disabled={props.disabled}
   onPress={()=>props.onTap(props.side,props.index)}
   style={{flex:1,borderRadius:18,borderWidth:props.selected?3:props.matched?2:1.5,
    borderColor:props.selected?colors.primary:props.matched?'#52A878':colors.border,
    backgroundColor:colors.surface,padding:8,
    alignItems:'center',justifyContent:'center'}}>
   <ItemLabel value={props.value}/>
  </Pressable>
 </View>;
}

/** PeerToPeer: either side can start a tap or drag; only the server judges correctness. */
export function MatchingRenderer({sources,targets,matches,onConnect,disabled=false}:Props){
 const {colors}=useAppTheme();
 const board=useRef<View>(null);
 const boardOrigin=useRef<{x:number;y:number}|null>(null);
 const [selected,setSelected]=useState<Selection|null>(null);
 const [drag,setDrag]=useState<Drag|null>(null);
 const [rects,setRects]=useState<Record<string,Rect>>({});
 const [columns,setColumns]=useState<Partial<Record<Side,Rect>>>({});
 const latest=useRef({rects,columns,disabled,onConnect,sourcesCount:sources.length,targetsCount:targets.length});
 latest.current={rects,columns,disabled,onConnect,sourcesCount:sources.length,targetsCount:targets.length};
 const dragStart=useRef<Selection|null>(null);
 const refreshOrigin=()=>{
  board.current?.measureInWindow((x,y)=>{boardOrigin.current={x,y};});
 };
 const remember=(key:string)=>(e:LayoutChangeEvent)=>{
  // Snapshot the native event before React executes the state updater.
  const {x,y,width,height}=e.nativeEvent.layout;
  setRects(previous=>{
   const old=previous[key];
   return old&&old.x===x&&old.y===y&&old.width===width&&old.height===height
    ?previous:{...previous,[key]:{x,y,width,height}};
  });
 };
 const rememberColumn=(side:Side)=>(e:LayoutChangeEvent)=>{
  const {x,y,width,height}=e.nativeEvent.layout;
  setColumns(previous=>{
   const old=previous[side];
   return old&&old.x===x&&old.y===y&&old.width===width&&old.height===height
    ?previous:{...previous,[side]:{x,y,width,height}};
  });
 };
 const tileRect=(side:Side,index:number,layout=latest.current)=>{
  const col=layout.columns[side],item=layout.rects[`${side}:${index}`];
  return col&&item?{x:col.x+item.x,y:col.y+item.y,width:item.width,height:item.height}:null;
 };
 const anchor=(side:Side,index:number)=>{
  const rect=tileRect(side,index);
  return rect?{x:side==='source'?rect.x:rect.x+rect.width,y:rect.y+rect.height/2}:null;
 };
 const connect=(first:Selection,second:Selection)=>{
  if(first.side===second.side||latest.current.disabled)return;
  latest.current.onConnect(first.side==='source'?first.index:second.index,
   first.side==='target'?first.index:second.index);
 };
 const tap=(side:Side,index:number)=>{
  if(latest.current.disabled)return;
  const touched:Selection={side,index};
  if(!selected){setSelected(touched);return;}
  if(selected.side===side){
   setSelected(selected.index===index?null:touched);
  }else{
   setSelected(null);
   connect(selected,touched);
  }
 };
 const begin=(side:Side,index:number)=>{
  if(latest.current.disabled)return;
  dragStart.current={side,index};
  setSelected(null);
  const start=anchor(side,index);
  if(start)setDrag({side,index,...start});
  refreshOrigin();
 };
 const move=(pageX:number,pageY:number,dx:number,dy:number)=>{
  const first=dragStart.current;
  if(!first||latest.current.disabled)return;
  const point=anchor(first.side,first.index);
  const origin=boardOrigin.current;
  if(!point)return;
  setDrag({...first,x:origin?pageX-origin.x:point.x+dx,
   y:origin?pageY-origin.y:point.y+dy});
 };
 const finish=(pageX:number,pageY:number)=>{
  const first=dragStart.current;
  dragStart.current=null;
  setDrag(null);
  if(!first||latest.current.disabled)return;
  const endSide:Side=first.side==='source'?'target':'source';
  const tryConnect=(x:number,y:number)=>{
   if(latest.current.disabled)return;
   const count=endSide==='source'?latest.current.sourcesCount:latest.current.targetsCount;
   for(let index=0;index<count;index++){
    const rect=tileRect(endSide,index);
    if(rect&&x>=rect.x-12&&x<=rect.x+rect.width+12
     &&y>=rect.y-12&&y<=rect.y+rect.height+12){
     connect(first,{side:endSide,index});
     return;
    }
   }
  };
  if(board.current){
   board.current.measureInWindow((x,y)=>{
    boardOrigin.current={x,y};
    tryConnect(pageX-x,pageY-y);
   });
  }else if(boardOrigin.current){
   tryConnect(pageX-boardOrigin.current.x,pageY-boardOrigin.current.y);
  }
 };
 const cancel=()=>{dragStart.current=null;setDrag(null);};
 useEffect(()=>{if(disabled){dragStart.current=null;setDrag(null);setSelected(null);}},[disabled]);
 const currentAnchor=drag?anchor(drag.side,drag.index):null;
 return <View ref={board} collapsable={false} style={{width:'100%',minHeight:120}}>
  <Svg pointerEvents="none" width="100%" height="100%"
   style={{position:'absolute',left:0,top:0}}>
   {matches.map(match=>{
    const from=anchor('source',match.sourceIndex);
    const to=anchor('target',match.targetIndex);
    return from&&to?<Line key={match.sourceIndex} x1={from.x} y1={from.y}
     x2={to.x} y2={to.y} stroke={colors.primary} strokeWidth={4}
     strokeLinecap="round"/>:null;
   })}
   {drag&&currentAnchor?<Line x1={currentAnchor.x} y1={currentAnchor.y}
    x2={drag.x} y2={drag.y} stroke={colors.primary} strokeWidth={4}
    strokeDasharray="7 5" strokeLinecap="round"/>:null}
   {drag&&currentAnchor?<Circle cx={currentAnchor.x} cy={currentAnchor.y}
    r={5} fill={colors.primary}/>:null}
  </Svg>
  <View style={{flexDirection:'row-reverse',gap:44,alignItems:'flex-start'}}>
   <View onLayout={rememberColumn('source')} style={{flex:1,gap:14,alignItems:'flex-end'}}>
    {sources.map((value,index)=><MatchTile key={index} value={value} side="source"
     index={index} selected={selected?.side==='source'&&selected.index===index}
     matched={matches.some(m=>m.sourceIndex===index)} disabled={disabled}
     onTap={tap} onDragBegin={begin} onDragMove={move} onDragEnd={finish}
     onDragCancel={cancel} onTouchBegin={refreshOrigin}
     onLayout={remember(`source:${index}`)}/>)}
   </View>
   <View onLayout={rememberColumn('target')} style={{flex:1,gap:14,alignItems:'flex-start'}}>
    {targets.map((value,index)=><MatchTile key={index} value={value} side="target"
     index={index} selected={selected?.side==='target'&&selected.index===index}
     matched={matches.some(m=>m.targetIndex===index)} disabled={disabled}
     onTap={tap} onDragBegin={begin} onDragMove={move} onDragEnd={finish}
     onDragCancel={cancel} onTouchBegin={refreshOrigin}
     onLayout={remember(`target:${index}`)}/>)}
   </View>
  </View>
 </View>;
}
