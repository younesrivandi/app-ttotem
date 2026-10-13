import { useEffect, useState } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
    tabBarStyle:{backgroundColor:'#fffaf4',borderTopColor:'#fff',borderTopWidth:2,borderTopLeftRadius:34,borderTopRightRadius:34,height:72,paddingTop:8,paddingBottom:8,position:'absolute',marginHorizontal:18,marginBottom:10,borderRadius:36,overflow:'hidden'},
    tabBarLabelStyle:{fontSize:12,fontWeight:'600'},
    tabBarHideOnKeyboard:true,
  }}>
    <Tabs.Screen name="index" options={{href:null}} />
    <Tabs.Screen name="journeys/index" options={{title:'خانه',tabBarIcon:({color,size})=><Ionicons name="home" color={color} size={size+4}/>}} />
    <Tabs.Screen name="children" options={{href:null,tabBarStyle:{display:'none'}}} />
    <Tabs.Screen name="parent" options={{title:'والد',tabBarIcon:({color,size})=><Ionicons name="trophy" color={color} size={size}/>}} />
    <Tabs.Screen name="leaderboard" options={{title:'رتبه‌بندی',tabBarIcon:({color,size})=><Ionicons name="compass" color={color} size={size}/>}} />
  </Tabs>;
}
