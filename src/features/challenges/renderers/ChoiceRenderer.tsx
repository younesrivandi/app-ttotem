import {Image,Pressable,StyleSheet,View} from 'react-native';
import {AppText} from '@/components/ui/AppText';
import {useAppTheme} from '@/theme/ThemeProvider';
import {AudioOption,ItemLabel,objectItem} from './shared';

const SELECTED_GREEN='#16A34A';
const TILE_GAP=12;

type ChoiceProps={
 options:readonly unknown[];
 selected:readonly number[];
 onSelect:(index:number)=>void;
 disabled?:boolean;
};

type TileProps={
 value:unknown;
 index:number;
 selected:boolean;
 disabled:boolean;
 grid:boolean;
 onSelect:(index:number)=>void;
};

function ChoiceTile({value,index,selected,disabled,grid,onSelect}:TileProps){
 const {colors}=useAppTheme();
 const item=objectItem(value);
 const imageUrl=typeof item.imageUrl==='string'&&item.imageUrl.length>0?item.imageUrl:null;
 const label=item.text??item.label??item.title;
 return <Pressable
  accessibilityRole="button"
  accessibilityLabel={`گزینه ${index+1}${label?`، ${label}`:''}`}
  accessibilityState={{selected,disabled}}
  disabled={disabled}
  onPress={()=>onSelect(index)}
  style={{
   backgroundColor:colors.surface,
   borderRadius:16,
   overflow:'hidden',
   position:'relative',
   justifyContent:'center',
   alignItems:'center',
   ...(grid?{flex:1,aspectRatio:1 as const,minWidth:0}:{minHeight:68,paddingHorizontal:14,paddingVertical:12}),
  }}>
  {imageUrl?
   <>
    <Image source={{uri:imageUrl}} resizeMode="cover" style={StyleSheet.absoluteFillObject}/>
    {label?<View pointerEvents="none" style={{
      position:'absolute',bottom:0,left:0,right:0,paddingHorizontal:8,paddingVertical:8,
      backgroundColor:'rgba(0,0,0,0.5)',
     }}><AppText weight="700" style={{color:'#FFFFFF',textAlign:'center'}}>{label}</AppText></View>:null}
    {item.audioUrl?<View style={{position:'absolute',left:6,top:6}}><AudioOption uri={item.audioUrl}/></View>:null}
   </>:
   <ItemLabel value={value} centered/>
  }
  <View pointerEvents="none" style={[StyleSheet.absoluteFillObject,{
   borderWidth:selected?3:1,
   borderColor:selected?SELECTED_GREEN:colors.border,
   borderRadius:16,
  }]}/>
  {selected?<View pointerEvents="none" style={{
   position:'absolute',top:8,right:8,minWidth:28,height:28,paddingHorizontal:5,
   alignItems:'center',justifyContent:'center',
   borderRadius:16,backgroundColor:'#FFFFFF',
   borderWidth:2,borderColor:SELECTED_GREEN,
  }}><AppText weight="700" style={{color:SELECTED_GREEN,fontSize:19,lineHeight:23}}>✓</AppText></View>:null}
 </Pressable>;
}

/** Photo choices fill square tiles, two per row; text-only choices stay full-width. */
export function ChoiceRenderer({options,selected,onSelect,disabled=false}:ChoiceProps){
 const hasPhotos=options.some(value=>Boolean(objectItem(value).imageUrl));
 if(!hasPhotos){
  return <View style={{gap:TILE_GAP}}>{options.map((value,index)=>
   <ChoiceTile key={index} value={value} index={index} selected={selected.includes(index)}
    disabled={disabled} grid={false} onSelect={onSelect}/>
  )}</View>;
 }
 const rows=Math.ceil(options.length/2);
 return <View style={{gap:TILE_GAP}}>
  {Array.from({length:rows},(_,row)=>{
   const start=row*2;
   return <View key={start} style={{flexDirection:'row-reverse',gap:TILE_GAP}}>
    {options.slice(start,start+2).map((value,offset)=>{
     const index=start+offset;
     return <ChoiceTile key={index} value={value} index={index}
      selected={selected.includes(index)} disabled={disabled} grid onSelect={onSelect}/>;
    })}
    {start+1>=options.length?<View style={{flex:1}}/>:null}
   </View>;
  })}
 </View>;
}
