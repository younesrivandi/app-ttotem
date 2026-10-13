import { Image, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
export type Item = {text?:string;label?:string;title?:string;imageUrl?:string;audioUrl?:string};
export function objectItem(v:unknown):Item {if(typeof v==='string'||typeof v==='number')return {text:String(v)};if(typeof v==='object'&&v!==null)return v as Item;return {text:'—'};}
export function ItemLabel({value}:{value:unknown}){const v=objectItem(value);return <View style={{flexDirection:'row-reverse',alignItems:'center',gap:10,flex:1}}>{v.imageUrl?<Image source={{uri:v.imageUrl}} style={{width:68,height:68,borderRadius:8}} resizeMode="contain"/>:null}<AppText style={{flexShrink:1}}>{v.text??v.label??v.title??'تصویر'}</AppText></View>;}
