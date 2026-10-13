import { useLocalSearchParams } from 'expo-router';
import { StageChallengesScreen } from '@/features/stages/screens/StageChallengesScreen';
export default function Page(){const {stageId}=useLocalSearchParams<{stageId:string}>();return <StageChallengesScreen stageId={stageId??''}/>;}
