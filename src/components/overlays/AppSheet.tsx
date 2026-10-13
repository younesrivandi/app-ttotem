import { forwardRef, useMemo } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView, type BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export type AppSheetHandle = BottomSheetModal;
type Props = { children:React.ReactNode; onDismiss?:()=>void; snapPoints?:string[] };
/** Managed by @gorhom/bottom-sheet, not a custom gesture implementation. */
export const AppSheet = forwardRef<AppSheetHandle,Props>(function AppSheet({children,onDismiss,snapPoints},ref) {
 const {colors}=useAppTheme();
 const points=useMemo(()=>snapPoints??['45%','75%'],[snapPoints]);
 const backdrop:NonNullable<BottomSheetModalProps['backdropComponent']> = (props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close"/>;
 return <BottomSheetModal ref={ref} snapPoints={points} enablePanDownToClose onDismiss={onDismiss} backdropComponent={backdrop}
   backgroundStyle={{backgroundColor:colors.surface}} handleIndicatorStyle={{backgroundColor:colors.textMuted}}>
   <BottomSheetView style={{padding:spacing.lg}}>{children}</BottomSheetView>
 </BottomSheetModal>;
});
