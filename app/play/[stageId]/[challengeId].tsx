import { Redirect, useLocalSearchParams } from 'expo-router';
import { PlayChallengeScreen } from '@/features/challenges/screens/PlayChallengeScreen';
export default function Page() {
  const { stageId, challengeId } = useLocalSearchParams<{stageId:string;challengeId:string}>();
  if (!stageId || !challengeId || stageId === 'demo' || challengeId === 'demo') return <Redirect href="/" />;
  return <PlayChallengeScreen stageId={stageId} challengeId={challengeId} />;
}
