import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useAppTheme } from '@/theme/ThemeProvider';
import { tabArtwork } from '@/components/navigation/tabArtwork';
import { bootstrapSession, currentSession, subscribeSession } from '@/services/auth/session';

type TabArtworkName = keyof typeof tabArtwork;
function ArtworkIcon({ name, focused }: { name: TabArtworkName; focused: boolean }) {
  return <View style={{
    width: 66, height: 58, alignItems: 'center', justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: focused ? 'rgba(173,113,233,0.14)' : 'transparent',
    shadowColor: '#8141C6', shadowOffset: { width: 0, height: 0 },
    shadowRadius: focused ? 11 : 0, shadowOpacity: focused ? 0.7 : 0,
    elevation: focused ? 5 : 0,
    transform: [{ scale: focused ? 1.12 : 0.96 }],
  }}>
    <Image source={{ uri: tabArtwork[name] }} resizeMode="contain"
      style={{ width: 57, height: 57, opacity: focused ? 1 : 0.82 }} />
    {focused && <View style={{ position: 'absolute', bottom: -2, width: 18, height: 4, borderRadius: 3, backgroundColor: '#8141C6' }} />}
  </View>;
}

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
    headerShown: false,
    tabBarShowLabel: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarItemStyle: { alignItems: 'center', justifyContent: 'center', padding: 0 },
    tabBarStyle: {
      position: 'absolute', backgroundColor: '#fffaf4',
      borderTopColor: '#fff', borderTopWidth: 2,
      borderRadius: 36, height: 78, marginHorizontal: 18,
      marginBottom: 10, paddingTop: 4, paddingBottom: 4,
      shadowColor: '#55412c', shadowOpacity: 0.18,
      shadowRadius: 11, elevation: 8,
    },
    tabBarHideOnKeyboard: true,
  }}>
    <Tabs.Screen name="index" options={{ href: null }} />
    <Tabs.Screen name="parent" options={{
      title: 'والد', tabBarAccessibilityLabel: 'بخش والد',
      tabBarIcon: ({ focused }) => <ArtworkIcon name="trophy" focused={focused} />,
    }} />
    <Tabs.Screen name="journeys/index" options={{
      title: 'خانه', tabBarAccessibilityLabel: 'سفرها',
      tabBarIcon: ({ focused }) => <ArtworkIcon name="home" focused={focused} />,
    }} />
    <Tabs.Screen name="leaderboard" options={{
      title: 'رتبه‌بندی', tabBarAccessibilityLabel: 'رتبه‌بندی',
      tabBarIcon: ({ focused }) => <ArtworkIcon name="compass" focused={focused} />,
    }} />
    <Tabs.Screen name="children" options={{ href: null, tabBarStyle: { display: 'none' } }} />
  </Tabs>;
}
