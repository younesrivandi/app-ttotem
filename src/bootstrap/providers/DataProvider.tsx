import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { bootstrapSession, subscribeSession } from '@/services/auth/session';
export function DataProvider({children}:{children:ReactNode}) {
  const [client] = useState(() => new QueryClient({defaultOptions:{queries:{retry:1,staleTime:30_000},mutations:{retry:0}}}));
  useEffect(() => {
    void bootstrapSession();
    // Conservative isolation: no cached child/parent data crosses session changes.
    return subscribeSession(() => client.clear());
  }, [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
