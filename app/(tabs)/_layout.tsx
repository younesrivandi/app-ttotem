import { Tabs } from 'expo-router';
import { useAppTheme } from '@/theme/ThemeProvider';

/** Routes in this group keep their existing public URLs. */
export default function MainTabs() {
  const { colors } = useAppTheme();
  return <Tabs screenOptions={{
    headerShown:false,
    tabBarActiveTintColor:colors.primary,
    tabBarInactiveTintColor:colors.textMuted,
    tabBarStyle:{backgroundColor:colors.surface,borderTopColor:colors.border},
    tabBarLabelStyle:{fontSize:12,fontWeight:'600'},
    tabBarHideOnKeyboard:true,
  }}>
    <Tabs.Screen name="index" options={{title:'خانه'}} />
    <Tabs.Screen name="journeys/index" options={{title:'سفرها'}} />
    <Tabs.Screen name="children" options={{title:'کودکان'}} />
    <Tabs.Screen name="parent" options={{title:'والد'}} />
    <Tabs.Screen name="leaderboard" options={{title:'رتبه‌بندی'}} />
  </Tabs>;
}
