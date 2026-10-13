import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DataProvider } from '@/bootstrap/providers/DataProvider';
import { AppThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

function Navigation() {
  const { resolvedMode, colors } = useAppTheme();
  return <>
    <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
    <Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.background}}}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="navigation-lab" options={{presentation:'card'}} />
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
