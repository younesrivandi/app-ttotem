import { useEffect, useState } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAppTheme } from '@/theme/ThemeProvider';
import { bootstrapSession, currentSession, subscribeSession } from '@/services/auth/session';

/** Keep private tab routes hidden until credentials have been loaded. */
export default function MainTabs() {
  const { colors } = useAppTheme();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (!active) return;
      const session = currentSession();
      setAuthenticated(Boolean(session.parent?.accessToken || (session.child?.accessToken && session.childId)));
      setReady(true);
    };
    const unsubscribe = subscribeSession(sync);
    void bootstrapSession().then(sync);
    return () => { active = false; unsubscribe(); };
  }, []);

  if (!ready) return null;
  if (!authenticated) return <Redirect href="/login" />;

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
