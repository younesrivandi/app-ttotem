import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { bootstrapSession, currentSession, subscribeSession } from '@/services/auth/session';

export default function HomeRedirect() {
  const [ready, setReady] = useState(false);
  const [destination, setDestination] = useState<'/login' | '/children' | '/journeys'>('/login');
  useEffect(() => {
    let active = true;
    const sync = () => {
      if (!active) return;
      const session = currentSession();
      setDestination(!session.parent?.accessToken ? '/login'
        : session.childId && session.child?.accessToken ? '/journeys' : '/children');
      setReady(true);
    };
    const unsubscribe = subscribeSession(sync);
    void bootstrapSession().then(sync).catch(sync);
    return () => { active = false; unsubscribe(); };
  }, []);
  return ready ? <Redirect href={destination} /> : null;
}
