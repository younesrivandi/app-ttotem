import {useEffect,useRef} from 'react';
import {View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {AppSheet,type AppSheetHandle} from '@/components/overlays/AppSheet';
import {AppText} from '@/components/ui/AppText';
import {AppButton} from '@/components/ui/AppButton';
import {LoadingState,ErrorState} from '@/components/ui/AsyncState';
import {spacing} from '@/theme/tokens';
import {getStageResult} from '../api/resultsApi';
import {resultStats} from '../model/stageResult';
const message=(e:unknown)=>e instanceof Error?e.message:'دریافت نتیجه انجام نشد';
type Props={stageId:string;childId:string;open:boolean;onClose:()=>void;onContinue:()=>void;onReplay:()=>void};
export function StageResultSheet({stageId,childId,open,onClose,onContinue,onReplay}:Props){
 const ref=useRef<AppSheetHandle>(null);
 const query=useQuery({queryKey:['child',childId,'stages',stageId,'result'],queryFn:()=>getStageResult(stageId),enabled:open&&!!childId&&!!stageId,staleTime:0,retry:1});
 useEffect(()=>{if(open){ref.current?.present();}else{ref.current?.dismiss();}},[open]);
 const stats=query.data?resultStats(query.data):null;
 return <AppSheet ref={ref} snapPoints={['70%','90%']} onDismiss={onClose}>
  <View style={{gap:spacing.md,alignItems:'center'}}>
   <AppText variant="title" weight="700">مرحله تموم شد! 🎉</AppText>
   <AppText>عالی بود! نتیجه مرحله از سرور دریافت می‌شود.</AppText>
   {query.isPending?<LoadingState title="نتیجه داره آماده می‌شه…"/>:query.isError?<ErrorState description={message(query.error)} onRetry={()=>{void query.refetch();}}/>:stats?<>
    <AppText variant="title" accessibilityLabel={`${stats.stars} ستاره`}>{'★'.repeat(stats.stars)}{'☆'.repeat(3-stats.stars)}</AppText>
    <View style={{flexDirection:'row',gap:spacing.md,flexWrap:'wrap',justifyContent:'center'}}>
      <View style={{alignItems:'center'}}><AppText weight="700">{stats.score}</AppText><AppText>امتیاز مرحله</AppText></View>
      <View style={{alignItems:'center'}}><AppText weight="700">{stats.correctCount}</AppText><AppText>پاسخ درست</AppText></View>
      <View style={{alignItems:'center'}}><AppText weight="700">{stats.attemptCount}</AppText><AppText>تلاش</AppText></View>
    </View>
    <AppButton title="ادامه مسیر" fullWidth onPress={onContinue}/>
    <AppButton title="دوباره بازی کن" variant="outline" fullWidth onPress={onReplay}/>
   </>:null}
  </View>
 </AppSheet>;
}
