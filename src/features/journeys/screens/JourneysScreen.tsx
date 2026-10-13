import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/AsyncState';
import { spacing } from '@/theme/tokens';
import { bootstrapSession,currentSession,subscribeSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { listJourneys,chooseJourney } from '../api/journeysApi';
import { JourneyCard } from '../components/JourneyCard';
const CARD_WIDTH=250, CARD_GAP=12;
const errorMessage=(e:unknown)=>e instanceof Error?e.message:'خطایی رخ داد.';
export function JourneysScreen() {
 const router=useRouter(),client=useQueryClient(),scrollRef=useRef<ScrollView>(null);
 const [ready,setReady]=useState(false),[childId,setChildId]=useState(''),[selected,setSelected]=useState(0);
 const selectedId=useRef<string|null>(null);
 useEffect(()=>{let active=true;const sync=()=>{if(active){setChildId(currentSession().childId??'');setReady(true);}};void bootstrapSession().then(sync);const unsubscribe=subscribeSession(sync);return()=>{active=false;unsubscribe();};},[]);
 const authorized=ready&&!!currentSession().child?.accessToken;
 const query=useQuery({queryKey:queryKeys.journeys(childId),queryFn:listJourneys,enabled:authorized&&!!childId});
 const journeys=query.data??[];
 const mutation=useMutation({mutationFn:chooseJourney,onSuccess:async()=>{await client.invalidateQueries({queryKey:queryKeys.journeys(childId)});}});
 // Restore the backend-marked most recently selected journey when available.
 useEffect(()=>{if(!journeys.length)return;const current=selectedId.current;const index=current?journeys.findIndex(j=>j.journeyId===current):-1;
 const latest=journeys.findIndex(j=>j.isLatestSelected);const next=index>=0?index:latest>=0?latest:Math.min(1,journeys.length-1);
 setSelected(next); selectedId.current=journeys[next]?.journeyId??null;
 },[journeys]);
 const selectIndex=(index:number)=>{if(index<0||index>=journeys.length)return;setSelected(index);const item=journeys[index];if(!item)return;selectedId.current=item.journeyId;scrollRef.current?.scrollTo({x:Math.max(0,index*(CARD_WIDTH+CARD_GAP)-24),animated:true});
 // Legacy client selected on changing active card. Avoid re-sending selection for locked entries.
 if(!item.isLocked && !mutation.isPending) mutation.mutate(item.journeyId);
 };
 const open=(index:number)=>{const item=journeys[index];if(!item||item.isLocked)return;if(index!==selected){selectIndex(index);return;}router.push({pathname:'/journeys/[journeyId]',params:{journeyId:item.journeyId}});};
 if(!ready)return <AppScreen><LoadingState title="بررسی نشست کودک…"/></AppScreen>;
 if(!authorized || !childId)return <AppScreen contentStyle={{gap:spacing.md}}><ErrorState title="پروفایل کودک انتخاب نشده" description="برای دیدن سفرها، ابتدا کودک را انتخاب کنید."/><AppButton title="انتخاب کودک" onPress={()=>router.push('/children')}/></AppScreen>;
 return <AppScreen contentStyle={{gap:spacing.md}}>
  <AppText variant="title" weight="700">سفرهای من</AppText>
  <AppText tone="muted">سفرها را به چپ و راست ورق بزن، سپس وارد سفر انتخاب‌شده شو.</AppText>
  {query.isLoading?<LoadingState title="دریافت سفرها…"/>:query.isError?<ErrorState description={errorMessage(query.error)} onRetry={()=>{void query.refetch();}}/>:journeys.length===0?<EmptyState title="هنوز سفری آماده نشده است"/>:
  <>
   <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:CARD_GAP,paddingVertical:spacing.sm}} accessibilityLabel="فهرست افقی سفرها" style={{flexGrow:0}}>
    {journeys.map((journey,index)=><JourneyCard key={journey.journeyId} journey={journey} index={index} active={index===selected} onPress={()=>open(index)}/>)}
   </ScrollView>
   <View style={{flexDirection:'row-reverse',alignItems:'center',justifyContent:'center',gap:spacing.sm}}>
    <AppButton title="قبلی" variant="outline" onPress={()=>selectIndex((selected-1+journeys.length)%journeys.length)}/>
    <AppText>{selected+1} از {journeys.length}</AppText>
    <AppButton title="بعدی" variant="outline" onPress={()=>selectIndex((selected+1)%journeys.length)}/>
   </View>
   <View style={{flexDirection:'row-reverse',justifyContent:'center',gap:spacing.xs,flexWrap:'wrap'}}>
    {journeys.map((journey,index)=><AppButton key={journey.journeyId} size="sm" title={index===selected?'●':'○'} variant="ghost" accessibilityLabel={`سفر ${index+1}`} onPress={()=>selectIndex(index)}/>)}
   </View>
   {!!mutation.error&&<AppText tone="error" accessibilityRole="alert">{errorMessage(mutation.error)}</AppText>}
   <AppButton fullWidth title={journeys[selected]?.isLocked?'این سفر قفل است':'ورود به سفر'} disabled={!!journeys[selected]?.isLocked||mutation.isPending} loading={mutation.isPending} onPress={()=>open(selected)}/>
  </>}
 </AppScreen>;
}
