import { Modal, Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';

type Props = { visible:boolean; title:string; message:string; onDismiss:()=>void; onConfirm?:()=>void };
export function AppDialog({visible,title,message,onDismiss,onConfirm}:Props) {
 const {colors}=useAppTheme();
 return <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss} accessibilityViewIsModal>
   <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:spacing.lg,backgroundColor:'rgba(0,0,0,0.55)'}}>
     <Pressable accessibilityLabel="بستن پنجره" onPress={onDismiss} style={{position:'absolute',top:0,bottom:0,left:0,right:0}}/>
     <View style={{backgroundColor:colors.surface,borderRadius:radii.lg,padding:spacing.lg,width:'100%',maxWidth:440,gap:spacing.md}}>
       <AppText weight="700">{title}</AppText><AppText>{message}</AppText>
       <View style={{flexDirection:'row-reverse',gap:spacing.sm}}>
        {onConfirm && <AppButton title="تأیید" onPress={()=>{onConfirm();onDismiss();}}/>}
        <AppButton title="انصراف" variant="outline" onPress={onDismiss}/>
       </View>
     </View>
   </View>
 </Modal>;
}
