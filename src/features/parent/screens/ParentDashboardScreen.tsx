import { useEffect,useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { LoadingState,ErrorState,EmptyState } from '@/components/ui/AsyncState';
import { spacing } from '@/theme/tokens';
import { currentSession,bootstrapSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { listChildren } from '@/features/children/api/childrenApi';
import { ChildStatisticsCard } from '../components/ChildStatisticsCard';
function errorMessage(error:unknown){return error instanceof Error?error.message:'خطایی در دریافت اطلاعات رخ داد.';}
export function ParentDashboardScreen(){
 const router=useRouter();const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;void bootstrapSession().then(()=>{if(active)setReady(true);}).catch(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
 const authorized=ready&&!!currentSession().parent?.accessToken;
 const children=useQuery({queryKey:queryKeys.children,queryFn:listChildren,enabled:authorized});
 if(!ready)return <AppScreen><LoadingState title="بررسی نشست والد…"/></AppScreen>;
 if(!authorized)return <AppScreen contentStyle={{gap:spacing.md}}><ErrorState title="ورود والد لازم است" description="برای دیدن گزارش پیشرفت کودکان ابتدا وارد حساب والد شوید."/><AppButton title="ورود والد" onPress={()=>router.replace('/login')}/></AppScreen>;
 return <AppScreen contentStyle={{gap:spacing.md}}>
  <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',gap:spacing.sm,flexWrap:'wrap'}}>
   <View style={{gap:spacing.xs}}><AppText variant="title" weight="700">بخش والدین</AppText><AppText tone="muted">گزارش رشد و یادگیری</AppText></View>
   <AppButton variant="outline" title="انتخاب کودک" onPress={()=>router.push('/children')}/>
  </View>
  <AppCard style={{gap:spacing.sm}}><AppText tone="primary" weight="700">❤️ همراه رشد کودک</AppText>
   <AppText variant="subtitle" weight="700">پیشرفت فرزندانتان، در یک نگاه</AppText>
   <AppText tone="muted">آمارها از نتیجه واقعی بازی‌ها و مسیرهای یادگیری محاسبه می‌شوند.</AppText>
  </AppCard>
  {children.isPending?<LoadingState title="دریافت فهرست کودکان…"/>:
   children.isError?<ErrorState title="دریافت کودکان ناموفق بود" description={errorMessage(children.error)} onRetry={()=>{void children.refetch();}}/>:
   children.data.length===0?<EmptyState title="هنوز کودکی ثبت نشده است" description="برای مشاهده آمار، ابتدا یک کودک اضافه کنید."/>:
   children.data.map((child,index)=><ChildStatisticsCard key={child.childProfileId} child={child} index={index}/>)}
  {children.data?.length===0&&<AppButton title="افزودن کودک" onPress={()=>router.push('/children')}/>}
 </AppScreen>;
}
