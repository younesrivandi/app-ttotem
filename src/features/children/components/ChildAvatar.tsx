import { AppAvatar } from '@/components/ui/AppAvatar';
import type { ImageSourcePropType } from 'react-native';
import type { Child } from '../model/child';
const boy=[require('../../../../assets/avatars/boy-01.png'),require('../../../../assets/avatars/boy-02.png'),require('../../../../assets/avatars/boy-03.png'),require('../../../../assets/avatars/boy-04.png')];
const girl=[require('../../../../assets/avatars/girl-01.png'),require('../../../../assets/avatars/girl-02.png'),require('../../../../assets/avatars/girl-03.png'),require('../../../../assets/avatars/girl-04.png')];
export type Gender='boy'|'girl';
export const avatarOptions:Record<Gender,ImageSourcePropType[]>={boy,girl};
export function ChildAvatar({child,index,size=64}:{child:Child;index:number;size?:number}) {
 const source=(index%2?girl:boy)[index%4];
 return <AppAvatar name={child.firstName} uri={child.avatarUrl??undefined} source={child.avatarUrl?undefined:source} size={size}/>;
}
