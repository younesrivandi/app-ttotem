import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {useEffect,useState,type ReactNode} from 'react';
import {bootstrapSession,currentRevision,currentSession,subscribeSession} from '@/services/auth/session';
import {ApiError,NetworkError} from '@/services/api/errors';

/**
 * A token rotation is NOT a change of user. Clearing the QueryClient on every
 * session notification orphaned in-flight queries while HTTP was replaying 401s.
 */
function identityKey():string{
 return `${currentRevision('parent')}:${currentRevision('child')}:${currentSession().childId??''}`;
}

export function DataProvider({children}:{children:ReactNode}){
 const [client]=useState(()=>new QueryClient({defaultOptions:{
  queries:{
   staleTime:30_000,
   // HTTP already attempts one token refresh + one replay for a 401.
   // Retrying authentication/validation errors here would duplicate requests.
   retry:(failureCount,error)=>
    failureCount<1 && (error instanceof NetworkError ||
      (error instanceof ApiError && error.status>=500)),
  },
  mutations:{retry:0},
 }}));

 useEffect(()=>{
  let previousIdentity=identityKey();
  const unsubscribe=subscribeSession(()=>{
   const nextIdentity=identityKey();
   // Access/refresh token rotation keeps the same identity revisions.
   if(nextIdentity===previousIdentity)return;
   previousIdentity=nextIdentity;
   // Isolation is still mandatory on logout, login and child/profile switch.
   client.clear();
  });
  void bootstrapSession();
  return unsubscribe;
 },[client]);

 return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
