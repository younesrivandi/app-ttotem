import {useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Image,PanResponder,View,type View as NativeView} from 'react-native';
import {AppText} from '@/components/ui/AppText';
import {API_BASE_URL} from '@/services/api/config';
import type {PuzzlePiece,PuzzlePlacement} from '../engine';

type Props={
 pieces:readonly PuzzlePiece[];
 boardImageUrl?:string|null;
 maskImageUrl?:string|null;
 placements:Record<string,PuzzlePlacement>;
 disabled:boolean;
 onDrop:(pieceId:string,x:number,y:number)=>void;
};

function imageUri(value?:string|null):string|undefined{
 const uri=value?.trim();
 if(!uri)return undefined;
 if(/^(https?:\/\/|data:|file:|content:|blob:)/i.test(uri))return uri;
 // Relative image paths returned by the backend need an absolute native URL.
 if(uri.startsWith('//'))return `https:${uri}`;
 return `${API_BASE_URL}/${uri.replace(/^\/+/, '')}`;
}

function DraggablePiece({piece,disabled,onDrop}:{
 piece:PuzzlePiece;disabled:boolean;
 onDrop:(id:string,x:number,y:number)=>void;
}){
 const [dragging,setDragging]=useState(false);
 const offset=useRef(new Animated.ValueXY({x:0,y:0})).current;
 const disabledRef=useRef(disabled);
 disabledRef.current=disabled;
 const dropRef=useRef(onDrop);
 dropRef.current=onDrop;
 const responder=useMemo(()=>PanResponder.create({
  onStartShouldSetPanResponder:()=>!disabledRef.current,
  onMoveShouldSetPanResponder:()=>!disabledRef.current,
  onPanResponderTerminationRequest:()=>false,
  onPanResponderGrant:()=>{offset.setValue({x:0,y:0});setDragging(true);},
  onPanResponderMove:(_event,gesture)=>offset.setValue({x:gesture.dx,y:gesture.dy}),
  onPanResponderRelease:(_event,gesture)=>{
   setDragging(false);
   offset.setValue({x:0,y:0});
   if(!disabledRef.current)dropRef.current(piece.id,gesture.moveX,gesture.moveY);
  },
  onPanResponderTerminate:()=>{setDragging(false);offset.setValue({x:0,y:0});},
 }),[piece.id,offset]);
 const uri=imageUri(piece.imageUrl);
 return <Animated.View {...responder.panHandlers} style={{
  width:82,height:82,borderRadius:14,
  borderWidth:dragging?2:1,borderColor:dragging?'#9B5BE6':'#E7DDF3',
  backgroundColor:dragging?'#EEE2FF':'#FFFFFF',
  alignItems:'center',justifyContent:'center',opacity:dragging?0.85:1,
  zIndex:dragging?100:0,elevation:dragging?12:0,
  transform:offset.getTranslateTransform(),
 }}>
  {uri?<Image source={{uri}} resizeMode="contain" style={{width:70,height:70}}/>:null}
 </Animated.View>;
}

/** Render the background AND its puzzle guide/mask in the same coordinate space. */
export function PuzzleRenderer({pieces,boardImageUrl,maskImageUrl,placements,disabled,onDrop}:Props){
 const boardRef=useRef<NativeView>(null);
 const [boardSize,setBoardSize]=useState({width:0,height:0});
 const [boardAspectRatio,setBoardAspectRatio]=useState(1);
 const [failed,setFailed]=useState<string[]>([]);
 const background=imageUri(boardImageUrl);
 const mask=imageUri(maskImageUrl);
 const displayMask=mask!==background?mask:undefined;
 const images=[background,displayMask].filter((url):url is string=>!!url);
 const firstImage=displayMask??background;
 useEffect(()=>{
  let active=true;
  setBoardAspectRatio(1);
  setFailed([]);
  // The guide is the authoritative aspect ratio: using the blank board's
  // size alone could produce the large empty square seen on Android.
  const candidates=[displayMask,background].filter((url):url is string=>!!url);
  const measure=(index:number)=>{
   if(index>=candidates.length)return;
   Image.getSize(candidates[index]!, (width,height)=>{
    if(active&&width>0&&height>0)setBoardAspectRatio(width/height);
    else if(active)measure(index+1);
   },()=>{if(active)measure(index+1);});
  };
  measure(0);
  return ()=>{active=false;};
 },[background,displayMask]);
 const onImageLoaded=(url:string,width:number,height:number)=>{
  if(url===firstImage&&width>0&&height>0)setBoardAspectRatio(width/height);
 };
 const onImageError=(url:string)=>setFailed(current=>current.includes(url)?current:[...current,url]);
 const placed=Object.values(placements);
 const available=pieces.filter(piece=>!placements[piece.id]);
 const sendDrop=(pieceId:string,pageX:number,pageY:number)=>{
  boardRef.current?.measureInWindow((left,top,width,height)=>{
   if(!width||!height)return;
   // Preserve the backend's normalized board-relative coordinate contract.
   const x=Math.max(0,Math.min(1,(pageX-left)/width));
   const y=Math.max(0,Math.min(1,(pageY-top)/height));
   onDrop(pieceId,x,y);
  });
 };
 const imageLayer=(url:string,key:string)=><Image key={key} source={{uri:url}} resizeMode="contain"
  style={{position:'absolute',left:0,top:0,width:'100%',height:'100%'}}
  onLoad={event=>onImageLoaded(url,event.nativeEvent.source.width,event.nativeEvent.source.height)}
  onError={()=>onImageError(url)}/>;
 return <View style={{gap:16}}>
  <View ref={boardRef} collapsable={false}
   onLayout={event=>{
    const {width,height}=event.nativeEvent.layout;
    setBoardSize(current=>current.width===width&&current.height===height?current:{width,height});
   }}
   style={{width:'100%',aspectRatio:boardAspectRatio,alignSelf:'center',
    backgroundColor:'#FFFFFF',borderRadius:24,borderWidth:1,
    borderColor:'#E7DDF3',overflow:'hidden'}}>
   {!!background&&imageLayer(background,'background')}
   {!!displayMask&&imageLayer(displayMask,'mask')}
   {images.length===0||images.every(url=>failed.includes(url))?
    <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:16}}>
     <AppText tone="error" style={{textAlign:'center'}}>
      تصویر راهنمای پازل در دسترس نیست. لطفاً دوباره تلاش کنید.
     </AppText>
    </View>:null}
   {placed.map(placement=>{
    const piece=pieces.find(item=>item.id===placement.pieceId);
    const uri=piece?imageUri(piece.imageUrl):undefined;
    if(!uri)return null;
    const width=placement.width*boardSize.width;
    const height=placement.height*boardSize.height;
    return <Image key={placement.pieceId} source={{uri}} resizeMode="contain"
     style={{position:'absolute',left:placement.x*boardSize.width-width/2,
      top:placement.y*boardSize.height-height/2,width,height}}/>;
   })}
  </View>
  <View style={{flexDirection:'row-reverse',flexWrap:'wrap',justifyContent:'center',gap:10}}>
   {available.map(piece=><DraggablePiece key={piece.id} piece={piece}
    disabled={disabled} onDrop={sendDrop}/>)}
  </View>
  <AppText style={{color:'#8B79A6',fontSize:12,textAlign:'center'}}>
   قطعه‌ها را روی جای درستشان بکش و رها کن
  </AppText>
  {disabled&&<AppText style={{textAlign:'center',color:'#7051A4'}}>در حال بررسی قطعه…</AppText>}
 </View>;
}
