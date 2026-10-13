import { useEffect,useState } from 'react';
import { Pressable,View } from 'react-native';
import { useLocalSearchParams,useRouter } from 'expo-router';
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { LoadingState,ErrorState,EmptyState } from '@/components/ui/AsyncState';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { bootstrapSession,currentSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { listChildren,chooseChild } from '@/features/children/api/childrenApi';
import { getPublicGroup,joinChildToGroup } from '../api/groupsApi';
import { savePendingJoin,clearPendingJoin } from '../services/pendingJoin';
const msg=(e:unknown)=>e instanceof Error?e.message:'ارتباط با سرور برقرار نشد.';
export function JoinGroupScreen(){
 const params=useLocalSearchParams<{slug:string}>();const slug=typeof params.slug==='string'?params.slug.trim():'';
 const router=useRouter(),client=useQueryClient();const {colors}=useAppTheme();
 const [ready,setReady]=useState(false),[selected,setSelected]=useState('');
 const [joinError,setJoinError]=useState('');
 const valid=slug.length>0&&slug.length<=200&&!slug.includes('/');
 useEffect(()=>{let active=true;void bootstrapSession().then(async()=>{
  if(!active)return;
  if(valid&&!currentSession().parent?.accessToken){await savePendingJoin(slug);if(active)router.replace('/login');}
  if(active)setReady(true);
 });return()=>{active=false;};},[router,slug,valid]);
 const authorized=ready&&!!currentSession().parent?.accessToken;
 const group=useQuery({queryKey:['publicGroup',slug],queryFn:()=>getPublicGroup(slug),enabled:valid});
 const children=useQuery({queryKey:queryKeys.children,queryFn:listChildren,enabled:authorized});
 useEffect(()=>{const first=children.data?.[0];if(first&&!children.data?.some(c=>c.childProfileId===selected))setSelected(first.childProfileId);},[children.data,selected]);
 const join=useMutation({mutationFn:async(childId:string)=>{
  // Do not select child until membership is confirmed by backend.
  await joinChildToGroup(slug,childId);
  await clearPendingJoin();
  await chooseChild(childId);
 },onSuccess:async()=>{await client.invalidateQueries();router.replace('/journeys');},onError:e=>setJoinError(msg(e))});
 return <AppScreen contentStyle={{gap:spacing.md}}>
  <AppText variant="title" weight="700">دعوت به گروه</AppText>
  {!valid?<ErrorState title="لینک عضویت نامعتبر است" description="شناسه دعوت در لینک صحیح نیست."/>:
  group.isLoading?<LoadingState title="دریافت اطلاعات گروه…"/>:
  group.isError?<ErrorState description={msg(group.error)} onRetry={()=>{void group.refetch();}}/>:
  <AppCard><View style={{gap:spacing.sm}}>
   <AppText variant="title" weight="700">{group.data?.name??'تی تو تم'}</AppText>
   <AppText tone="muted">{group.data?.description??'برای دیدن مسیرهای اختصاصی این مجموعه، یکی از فرزندانتان را انتخاب کنید.'}</AppText>
   {!!group.data?.address&&<AppText>📍 {group.data.address}</AppText>}
   {!!group.data?.services?.length&&<AppText tone="muted">{group.data.services.join(' · ')}</AppText>}
  </View></AppCard>}
  {valid&&ready&&!authorized&&<AppButton title="ورود والد" fullWidth onPress={()=>{void savePendingJoin(slug).then(()=>router.replace('/login'));}}/>}
  {valid&&authorized&&<>
   <AppText variant="subtitle" weight="700">کودک موردنظر را انتخاب کنید</AppText>
   {children.isLoading?<LoadingState title="دریافت کودکان…"/>:children.isError?<ErrorState description={msg(children.error)} onRetry={()=>{void children.refetch();}}/>:
    !children.data?.length?<View style={{gap:spacing.sm}}><EmptyState title="هنوز کودکی اضافه نشده"/><AppButton title="مدیریت کودکان" onPress={()=>router.push('/children')}/></View>:
    children.data.map(child=><Pressable key={child.childProfileId} accessibilityRole="button" accessibilityState={{selected:selected===child.childProfileId}} onPress={()=>setSelected(child.childProfileId)}>
     <AppCard style={{borderWidth:selected===child.childProfileId?2:1,borderColor:selected===child.childProfileId?colors.primary:colors.border}}>
      <View style={{flexDirection:'row-reverse',justifyContent:'space-between'}}><AppText weight="700">{child.firstName} {child.lastName}</AppText><AppText>⭐ {child.totalScore??0} {selected===child.childProfileId?'✓':''}</AppText></View>
     </AppCard>
    </Pressable>)}
   {!!joinError&&<AppText tone="error" accessibilityRole="alert">{joinError}</AppText>}
   <AppButton title="عضویت این کودک در گروه" loading={join.isPending} disabled={!selected||join.isPending||group.isError} fullWidth onPress={()=>{if(selected){setJoinError('');join.mutate(selected);}}}/>
  </>}
 </AppScreen>;
}
