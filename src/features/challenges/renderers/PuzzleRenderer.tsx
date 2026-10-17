import {useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Image,PanResponder,Pressable,View,useWindowDimensions,type View as NativeView} from 'react-native';
import {AppText} from '@/components/ui/AppText';
import type {PuzzlePiece,PuzzlePlacement} from '../engine';
import {fitPuzzleBoard,normalizePuzzleDrop} from './puzzleModel';

type Props={
 pieces:readonly PuzzlePiece[];
 background?:string;
 guide?:string;
 invalidPieces?:number;
 placements:Record<string,PuzzlePlacement>;
 disabled:boolean;
 onDrop:(pieceId:string,x:number,y:number)=>void;
};

function DraggablePiece({piece,disabled,selected,onSelect,onDrop}:{
 piece:PuzzlePiece;disabled:boolean;selected:boolean;
 onSelect:(id:string)=>void;
 onDrop:(id:string,pageX:number,pageY:number)=>void;
}){
 const offset=useRef(new Animated.ValueXY({x:0,y:0})).current;
 const [dragging,setDragging]=useState(false);
 const callbacks=useRef({disabled,onDrop,onSelect});
 callbacks.current={disabled,onDrop,onSelect};
 const pan=useMemo(()=>PanResponder.create({
  // Taps remain available for keyboard, mouse and screen-reader users.
  onStartShouldSetPanResponder:()=>false,
  onMoveShouldSetPanResponder:(_event,g)=>!callbacks.current.disabled&&
   (Math.abs(g.dx)>6||Math.abs(g.dy)>6),
  onPanResponderTerminationRequest:()=>false,
  onPanResponderGrant:()=>{offset.setValue({x:0,y:0});setDragging(true);},
  onPanResponderMove:(_event,g)=>offset.setValue({x:g.dx,y:g.dy}),
  onPanResponderRelease:(_event,g)=>{
   setDragging(false);offset.setValue({x:0,y:0});
   if(!callbacks.current.disabled)callbacks.current.onDrop(piece.id,g.moveX,g.moveY);
  },
  onPanResponderTerminate:()=>{setDragging(false);offset.setValue({x:0,y:0});},
 }),[offset,piece.id]);
 return <Animated.View {...pan.panHandlers} style={{
  width:82,height:82,borderRadius:14,zIndex:dragging?100:0,elevation:dragging?12:0,
  transform:offset.getTranslateTransform(),
 }}>
  <Pressable accessibilityRole="button"
   accessibilityLabel={`قطعه ${piece.id}؛ برای قرار دادن روی صفحه پازل لمس کنید یا بکشید`}
   accessibilityState={{selected,disabled}} disabled={disabled}
   onPress={()=>callbacks.current.onSelect(piece.id)} style={{
    width:'100%',height:'100%',borderRadius:14,borderWidth:selected||dragging?2:1,
    borderColor:selected||dragging?'#8B50CF':'#E7DDF3',
    backgroundColor:selected?'#F4EBFF':'#FFFFFF',
    justifyContent:'center',alignItems:'center',
   }}>
   <Image source={{uri:piece.imageUrl}} resizeMode="contain" style={{width:70,height:70}}/>
  </Pressable>
 </Animated.View>;
}

/** The board is sized to the loaded guide image, not a fixed white square. */
export function PuzzleRenderer({pieces,background,guide,invalidPieces=0,placements,disabled,onDrop}:Props){
 const {height:windowHeight}=useWindowDimensions();
 const boardRef=useRef<NativeView>(null);
 const live=useRef(true);
 const [containerWidth,setContainerWidth]=useState(0);
 const [ratio,setRatio]=useState(4/3);
 const [failed,setFailed]=useState<string[]>([]);
 const [loaded,setLoaded]=useState<string[]>([]);
 const [retry,setRetry]=useState(0);
 const [chosen,setChosen]=useState<string|null>(null);
 const images=[background,guide].filter((url):url is string=>!!url);
 const uniqueImages=[...new Set(images)];
 const primary=guide??background;
 const maxHeight=Math.max(190,windowHeight*0.56);
 const frame=fitPuzzleBoard(containerWidth,maxHeight,ratio);
 const canPlace=!!primary&&loaded.includes(primary)&&!disabled;
 const current=useRef({canPlace,onDrop});
 current.current={canPlace,onDrop};
 useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
 useEffect(()=>{
  let active=true;
  setFailed([]);setLoaded([]);setRatio(4/3);setChosen(null);
  const candidates=[primary,background].filter((url):url is string=>!!url);
  const getRatio=(i:number)=>{
   if(i>=candidates.length)return;
   Image.getSize(candidates[i]!, (width,height)=>{
    if(active&&width>0&&height>0)setRatio(width/height);
    else if(active)getRatio(i+1);
   },()=>{if(active)getRatio(i+1);});
  };
  getRatio(0);
  return()=>{active=false;};
 },[primary,background,retry]);
 const markLoaded=(url:string,width:number,height:number)=>{
  if(!live.current)return;
  setLoaded(previous=>previous.includes(url)?previous:[...previous,url]);
  if(url===primary&&width>0&&height>0)setRatio(width/height);
 };
 const markFailed=(url:string)=>{
  if(!live.current)return;
  setFailed(previous=>previous.includes(url)?previous:[...previous,url]);
 };
 const placeOnBoard=(pieceId:string,pageX:number,pageY:number)=>{
  if(!current.current.canPlace)return;
  boardRef.current?.measureInWindow((left,top,width,height)=>{
   if(!live.current||!current.current.canPlace)return;
   const point=normalizePuzzleDrop(pageX,pageY,{x:left,y:top,width,height});
   if(point)current.current.onDrop(pieceId,point.x,point.y);
  });
 };
 const boardTap=(event:{nativeEvent:{locationX:number;locationY:number}})=>{
  if(!chosen||!canPlace||!frame.width||!frame.height)return;
  const x=event.nativeEvent.locationX;
  const y=event.nativeEvent.locationY;
  const point=normalizePuzzleDrop(x,y,{x:0,y:0,width:frame.width,height:frame.height});
  if(!point)return;
  onDrop(chosen,point.x,point.y);
  setChosen(null);
 };
 const missing=uniqueImages.length===0;
 const allFailed=!missing&&uniqueImages.every(url=>failed.includes(url));
 const primaryFailed=!!primary&&failed.includes(primary);
 const available=pieces.filter(piece=>!placements[piece.id]);
 return <View style={{gap:14,width:'100%'}} onLayout={event=>{
   const width=event.nativeEvent.layout.width;
   setContainerWidth(previous=>previous===width?previous:width);
  }}>
  {missing?<View style={{minHeight:120,padding:16,alignItems:'center',justifyContent:'center',backgroundColor:'#FFFFFF',borderRadius:18}}>
   <AppText tone="error" style={{textAlign:'center'}}>تصویر اصلی پازل از سرور دریافت نشده است.</AppText>
  </View>:
  <View style={{width:'100%',alignItems:'center'}}>
   <Pressable ref={boardRef} collapsable={false} onPress={boardTap}
    accessibilityRole="button" accessibilityLabel="محل قراردادن قطعه انتخاب‌شده روی صفحه پازل"
    style={{width:frame.width||'100%',height:frame.height||240,aspectRatio:frame.width?undefined:ratio,
     overflow:'hidden',borderRadius:20,borderWidth:1,borderColor:'#E7DDF3',backgroundColor:'#FFFFFF'}}>
    {!!background&&<Image key={`board:${background}:${retry}`} source={{uri:background}}
     resizeMode="contain" pointerEvents="none"
     style={{position:'absolute',left:0,right:0,top:0,bottom:0,width:'100%',height:'100%'}}
     onLoad={event=>markLoaded(background,event.nativeEvent.source?.width??0,event.nativeEvent.source?.height??0)}
     onError={()=>markFailed(background)}/>}
    {!!guide&&<Image key={`guide:${guide}:${retry}`} source={{uri:guide}}
     resizeMode="contain" pointerEvents="none"
     style={{position:'absolute',left:0,right:0,top:0,bottom:0,width:'100%',height:'100%'}}
     onLoad={event=>markLoaded(guide,event.nativeEvent.source?.width??0,event.nativeEvent.source?.height??0)}
     onError={()=>markFailed(guide)}/>}
    {Object.values(placements).map(placement=>{
     const piece=pieces.find(candidate=>candidate.id===placement.pieceId);
     if(!piece)return null;
     const w=placement.width*frame.width,h=placement.height*frame.height;
     return <Image key={placement.pieceId} source={{uri:piece.imageUrl}} pointerEvents="none"
      resizeMode="contain" style={{position:'absolute',left:placement.x*frame.width-w/2,
       top:placement.y*frame.height-h/2,width:w,height:h}}/>;
    })}
    {!canPlace&&!allFailed&&!primaryFailed?<View pointerEvents="none" style={{flex:1,justifyContent:'center',alignItems:'center'}}>
     <AppText tone="muted" style={{textAlign:'center'}}>در حال بارگذاری تصویر پازل…</AppText>
    </View>:null}
   </Pressable>
  </View>}
  {allFailed||primaryFailed?<View style={{gap:8,alignItems:'center'}}>
   <AppText tone="error" style={{textAlign:'center'}}>بارگذاری تصویر راهنمای پازل ناموفق بود. آدرس یا مجوز دسترسی تصویر را بررسی کنید.</AppText>
   <Pressable accessibilityRole="button" onPress={()=>setRetry(n=>n+1)} style={{padding:10,borderRadius:10,backgroundColor:'#EEE5F5'}}>
    <AppText weight="700" style={{textAlign:'center'}}>تلاش مجدد تصویر</AppText>
   </Pressable>
  </View>:null}
  {invalidPieces>0?<AppText tone="error" style={{textAlign:'center'}}>
   اطلاعات {invalidPieces} قطعه پازل ناقص است؛ پاسخ API باید اصلاح شود.
  </AppText>:null}
  {pieces.length===0?<AppText tone="error" style={{textAlign:'center'}}>قطعات پازل از سرور دریافت نشده‌اند.</AppText>:null}
  <View style={{flexDirection:'row-reverse',flexWrap:'wrap',justifyContent:'center',gap:10}}>
   {available.map(piece=><DraggablePiece key={piece.id} piece={piece} disabled={disabled||!canPlace}
    selected={chosen===piece.id} onSelect={id=>setChosen(previous=>previous===id?null:id)}
    onDrop={placeOnBoard}/>)}
  </View>
  <AppText style={{color:'#8B79A6',fontSize:12,textAlign:'center'}}>
   قطعه را بکش و رها کن؛ یا قطعه را لمس کن و جای آن را روی صفحه انتخاب کن
  </AppText>
  {disabled&&<AppText style={{textAlign:'center',color:'#7051A4'}}>در حال بررسی قطعه…</AppText>}
 </View>;
}
