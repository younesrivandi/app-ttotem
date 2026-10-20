import { Redirect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { PlayChallengeScreen } from '@/features/challenges/screens/PlayChallengeScreen';
export default function Page() {
  const { stageId, challengeId } = useLocalSearchParams<{stageId:string;challengeId:string}>();
  if (!stageId || !challengeId || stageId === 'demo' || challengeId === 'demo') return <Redirect href="/" />;
  return <>
    <StatusBar hidden={Platform.OS !== 'web'} />
    <PlayChallengeScreen stageId={stageId} challengeId={challengeId} />
  </>;
}
