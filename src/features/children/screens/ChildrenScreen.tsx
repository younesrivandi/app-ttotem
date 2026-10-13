import { useEffect,useRef,useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { EmptyState,ErrorState,LoadingState } from '@/components/ui/AsyncState';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { currentSession,bootstrapSession,clearRoleSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { listChildren,createChild,chooseChild } from '../api/childrenApi';
import { ChildAvatar } from '../components/ChildAvatar';
import { AddChildSheet,type AddChildSheetHandle } from '../components/AddChildSheet';
import type { CreateChildPayload } from '../model/child';
function message(error:unknown) {return error instanceof Error?error.message:'خطایی رخ داد. دوباره تلاش کنید.';}
export function ChildrenScreen() {
 const router=useRouter(),queryClient=useQueryClient();const {colors}=useAppTheme();
 const sheet=useRef<AddChildSheetHandle>(null);
 const [selected,setSelected]=useState('');const [authReady,setAuthReady]=useState(false);
 const [formServerError,setFormServerError]=useState('');const [loggingOut,setLoggingOut]=useState(false);
 useEffect(()=>{let active=true;void bootstrapSession().then(()=>{if(active)setAuthReady(true);});return()=>{active=false;};},[]);
 const logout=async()=>{if(loggingOut)return;setLoggingOut(true);try{await clearRoleSession('parent');queryClient.clear();router.replace('/login');}finally{setLoggingOut(false);}};
 const authorized=authReady && !!currentSession().parent?.accessToken;
 const query=useQuery({queryKey:queryKeys.children,queryFn:listChildren,enabled:authorized});
 useEffect(()=>{const firstChild=query.data?.[0];if(firstChild && !query.data?.some(c=>c.childProfileId===selected))setSelected(firstChild.childProfileId);},[query.data,selected]);
 const create=useMutation({mutationFn:createChild,onSuccess:child=>{
 setSelected(child.childProfileId);setFormServerError('');sheet.current?.dismiss();
 void queryClient.invalidateQueries({queryKey:queryKeys.children}).catch(()=>{});
 },onError:error=>setFormServerError(message(error))});
 const select=useMutation({mutationFn:chooseChild,onSuccess:async()=>{await queryClient.invalidateQueries({queryKey:['journeys']});router.replace('/journeys');}});
 const save=async(payload:CreateChildPayload)=>{setFormServerError('');await create.mutateAsync(payload);};
 if(!authReady)return <AppScreen><LoadingState title="بررسی نشست والد…"/></AppScreen>;
 if(!authorized)return <AppScreen><ErrorState title="ورود والد لازم است" description="برای مدیریت پروفایل کودکان ابتدا وارد شوید."/><AppButton title="ورود والد" onPress={()=>router.replace('/login')}/></AppScreen>;
 return <SafeAreaView edges={['top','bottom','left','right']} style={{flex:1,backgroundColor:colors.background}}>
  <View style={{flex:1,width:'100%',maxWidth:680,alignSelf:'center'}}>
   <View style={{paddingHorizontal:spacing.md,paddingTop:spacing.lg,paddingBottom:spacing.sm,gap:spacing.xs}}>
    <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',gap:spacing.sm}}>
     <AppText variant="title" weight="700" style={{flexShrink:1}}>مدیریت کودکان</AppText>
     <AppButton title="خروج" size="sm" variant="outline" textColor={colors.error} loading={loggingOut}
       style={{height:36,minWidth:68,borderRadius:999,paddingHorizontal:12,borderColor:colors.error,alignItems:'center',justifyContent:'center'}}
       onPress={()=>{void logout();}} />
    </View>
    <AppText tone="muted">یک پروفایل را انتخاب کن یا کودک جدیدی اضافه کن.</AppText>
   </View>
   <ScrollView style={{flex:1}} keyboardShouldPersistTaps="handled"
     contentContainerStyle={{paddingHorizontal:spacing.md,paddingTop:spacing.sm,paddingBottom:spacing.lg,gap:spacing.md}}>
    {query.isLoading?<LoadingState title="دریافت فهرست کودکان…"/>:query.isError && !query.data?<ErrorState description={message(query.error)} onRetry={()=>{void query.refetch();}}/>:
     query.data?.length===0?<EmptyState title="هنوز پروفایلی اضافه نشده" description="اولین کودک را اضافه کنید."/>:
     query.data?.map((child,i)=><Pressable key={child.childProfileId} accessibilityRole="button"
       accessibilityLabel={`انتخاب کودک ${child.firstName}`}
       accessibilityState={{selected:selected===child.childProfileId}} onPress={()=>setSelected(child.childProfileId)}>
       <AppCard style={{borderWidth:selected===child.childProfileId?2:1,borderColor:selected===child.childProfileId?colors.primary:colors.border}}>
        <View style={{flexDirection:'row-reverse',alignItems:'center',gap:spacing.md}}>
         <ChildAvatar child={child} index={i}/>
         <View style={{flex:1,gap:4}}>
          <AppText weight="700">{child.firstName} {child.lastName}</AppText>
          <AppText tone="muted">{child.age?`${child.age} ساله`:'ماجراجوی تی تو تم'}</AppText>
          <AppText>⭐ {child.totalScore??0}</AppText>
         </View>
         <AppText weight="700">{selected===child.childProfileId?'✓':'›'}</AppText>
        </View>
       </AppCard>
      </Pressable>)}
    {query.isError && !!query.data && <AppText tone="error" accessibilityRole="alert">به‌روزرسانی فهرست ناموفق بود؛ اطلاعات قبلی همچنان نمایش داده می‌شود.</AppText>}
    {!!select.error&&<AppText tone="error" accessibilityRole="alert">{message(select.error)}</AppText>}
   </ScrollView>
   <View style={{backgroundColor:colors.surface,borderTopColor:colors.border,borderTopWidth:1,paddingHorizontal:spacing.md,paddingTop:spacing.md,paddingBottom:spacing.md,gap:spacing.sm}}>
    <AppButton title="افزودن کودک جدید" variant="outline" fullWidth
      leadingIcon={<AppText style={{fontSize:24,lineHeight:26,fontWeight:'600',color:'#7742C2'}}>+</AppText>}
      style={{minHeight:52,borderRadius:999,borderColor:'#7742C2',borderWidth:1.5}}
      onPress={()=>{setFormServerError('');sheet.current?.present();}}/>
    <AppButton title="ورود به تی تو تم" loading={select.isPending} disabled={!selected||select.isPending} fullWidth
      style={{minHeight:54,borderRadius:999,backgroundColor:'#7742C2',shadowColor:'#4A218B',shadowOffset:{width:0,height:5},shadowOpacity:0.2,shadowRadius:9,elevation:4}}
      onPress={()=>{if(selected)select.mutate(selected);}}/>
   </View>
  </View>
  <AddChildSheet ref={sheet} saving={create.isPending} serverError={formServerError} onSave={save}/>
 </SafeAreaView>;
}
