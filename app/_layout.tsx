import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DataProvider } from '@/bootstrap/providers/DataProvider';
import { AppThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

function Navigation() {
  const { colors } = useAppTheme();
  return <>
    <StatusBar hidden />
    <Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.background}}}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" options={{presentation:'modal'}} />
      <Stack.Screen name="journeys/[journeyId]" />
      <Stack.Screen name="stages/[stageId]" />
      <Stack.Screen name="play/[stageId]/[challengeId]" />
      <Stack.Screen name="result/[stageId]" />
      <Stack.Screen name="join/[slug]" />
    </Stack>
  </>;
}
export default function RootLayout() {
  return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><AppThemeProvider>
    <DataProvider><BottomSheetModalProvider><Navigation /></BottomSheetModalProvider></DataProvider>
  </AppThemeProvider></SafeAreaProvider></GestureHandlerRootView>;
}
