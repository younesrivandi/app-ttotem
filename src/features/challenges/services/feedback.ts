import * as Haptics from 'expo-haptics';
/** Haptics are non-essential; never block a correct server response. */
async function safely(run:()=>Promise<void>):Promise<void>{try{await run()}catch{/* unsupported or disabled */}}
export const gameHaptics={
 select:()=>safely(()=>Haptics.selectionAsync()),
 start:()=>safely(()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
 correct:()=>safely(()=>Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
 incorrect:()=>safely(()=>Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
