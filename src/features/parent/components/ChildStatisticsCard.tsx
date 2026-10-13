import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { LoadingState,ErrorState } from '@/components/ui/AsyncState';
import { spacing } from '@/theme/tokens';
import { queryKeys } from '@/services/api/queryKeys';
import { ChildAvatar } from '@/features/children/components/ChildAvatar';
import type { Child } from '@/features/children/model/child';
import { loadChildStatistics } from '../api/parentApi';
import { clampPercent,formatLearningTime } from '../model/statistics';
import { StatTile } from './StatTile';
import { JourneyProgressList } from './JourneyProgressList';
function errMessage(error:unknown){return error instanceof Error?error.message:'در دریافت گزارش خطایی رخ داد.';}
export function ChildStatisticsCard({child,index}:{child:Child;index:number}) {
 const stats=useQuery({queryKey:queryKeys.childStatistics(child.childProfileId),queryFn:()=>loadChildStatistics(child.childProfileId)});
 const report=stats.data;
 return <AppCard style={{gap:spacing.md}}>
  <View style={{flexDirection:'row-reverse',gap:spacing.md,alignItems:'center'}}>
   <ChildAvatar child={child} index={index}/>
   <View style={{flex:1,gap:spacing.xs}}><AppText variant="subtitle" weight="700">{child.firstName} {child.lastName}</AppText>
   <AppText tone="muted">⭐ {report?.totalScore??child.totalScore??0} امتیاز</AppText></View>
  </View>
  {stats.isPending?<LoadingState title="در حال دریافت آمار کودک…"/>:
   stats.isError?<ErrorState title="آمار این کودک در دسترس نیست" description={errMessage(stats.error)} onRetry={()=>{void stats.refetch();}}/>:
   <><View style={{flexDirection:'row-reverse',flexWrap:'wrap',gap:spacing.sm}}>
    <StatTile icon="✓" label="مراحل کامل" value={report?.completedStages??0}/>
    <StatTile icon="🎯" label="دقت پاسخ‌ها" value={`${Math.round(clampPercent(report?.accuracyPercent))}٪`}/>
    <StatTile icon="🎮" label="تلاش‌ها" value={report?.totalAttempts??0}/>
    <StatTile icon="⏱" label="زمان یادگیری" value={formatLearningTime(report?.learningTimeSeconds)}/>
   </View><JourneyProgressList items={report?.journeyProgress??[]}/></>}
 </AppCard>;
}
