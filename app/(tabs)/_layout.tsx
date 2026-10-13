import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Redirect, Tabs, usePathname } from 'expo-router';
import { useAppTheme } from '@/theme/ThemeProvider';
import { tabArtwork } from '@/components/navigation/tabArtwork';
import { bootstrapSession, currentSession, subscribeSession } from '@/services/auth/session';

type TabArtworkName = keyof typeof tabArtwork;
function ArtworkIcon({ name, focused }: { name: TabArtworkName; focused: boolean }) {
  return <View style={{
    width: 58, height: 54, alignItems: 'center', justifyContent: 'center',
    transform: [{ translateY: -3 }],
  }}>
    <Image source={{ uri: tabArtwork[name] }} resizeMode="contain"
      style={{ width: 46, height: 46 }} />
    {focused && <View style={{
      position: 'absolute', bottom: 0, width: 24, height: 3,
      borderRadius: 2, backgroundColor: '#8141C6',
    }} />}
  </View>;
}

/** Keep private tab routes hidden until credentials have been loaded. */
export default function MainTabs() {
  const { colors } = useAppTheme();
  const pathname = usePathname();
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
  const session = currentSession();
  const childSelected = Boolean(session.childId && session.child?.accessToken);
  if (!childSelected && pathname !== '/' && pathname !== '/children') return <Redirect href="/children" />;

  return <Tabs screenOptions={{
    headerShown: false,
    tabBarShowLabel: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarItemStyle: { alignItems: 'center', justifyContent: 'center', padding: 0, height: 64 },
    tabBarIconStyle: { width: 58, height: 54, alignItems: 'center', justifyContent: 'center' },
    tabBarStyle: {
      position: 'absolute', backgroundColor: '#fffaf4',
      borderTopColor: '#fff', borderTopWidth: 2,
      borderRadius: 32, height: 64, marginHorizontal: 18,
      marginBottom: 10, paddingTop: 0, paddingBottom: 0,
      shadowColor: '#55412c', shadowOpacity: 0.18,
      shadowRadius: 11, elevation: 8,
    },
    tabBarHideOnKeyboard: true,
  }}>
    <Tabs.Screen name="index" options={{ href: null }} />
    <Tabs.Screen name="leaderboard" options={{
      title: 'رتبه‌بندی', tabBarAccessibilityLabel: 'رتبه‌بندی',
      tabBarIcon: ({ focused }) => <ArtworkIcon name="trophy" focused={focused} />,
    }} />
    <Tabs.Screen name="journeys/index" options={{
      title: 'خانه', tabBarAccessibilityLabel: 'سفرها',
      tabBarIcon: ({ focused }) => <ArtworkIcon name="home" focused={focused} />,
    }} />
    <Tabs.Screen name="parent" options={{
      title: 'والد', tabBarAccessibilityLabel: 'بخش والد',
      tabBarIcon: ({ focused }) => <ArtworkIcon name="compass" focused={focused} />,
    }} />
    <Tabs.Screen name="children" options={{ href: null, tabBarStyle: { display: 'none' } }} />
  </Tabs>;
}
