import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DataProvider } from '@/bootstrap/providers/DataProvider';
import { ToastProvider } from '@/components/ui/AppToast';
import { AppThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

function Navigation() {
  const { colors, resolvedMode } = useAppTheme();
  return <>
    <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} hidden={false} backgroundColor="transparent" />
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
    <View style={Platform.OS === 'web' ? { flex: 1, width: '100%', maxWidth: 425, alignSelf: 'center', overflow: 'hidden' } : { flex: 1 }}>
      <DataProvider><BottomSheetModalProvider><ToastProvider><Navigation /></ToastProvider></BottomSheetModalProvider></DataProvider>
    </View>
  </AppThemeProvider></SafeAreaProvider></GestureHandlerRootView>;
}
