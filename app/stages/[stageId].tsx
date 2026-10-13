import { Redirect, useLocalSearchParams } from 'expo-router';
import { StageChallengesScreen } from '@/features/stages/screens/StageChallengesScreen';
export default function Page() {
  const { stageId } = useLocalSearchParams<{stageId:string}>();
  if (!stageId || stageId === 'demo') return <Redirect href="/" />;
  return <StageChallengesScreen stageId={stageId} />;
}
