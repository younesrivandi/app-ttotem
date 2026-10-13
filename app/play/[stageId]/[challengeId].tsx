import {useLocalSearchParams} from 'expo-router';
import {PlayChallengeScreen} from '@/features/challenges/screens/PlayChallengeScreen';
export default function Page(){const {stageId,challengeId}=useLocalSearchParams<{stageId:string;challengeId:string}>();return <PlayChallengeScreen stageId={stageId??''} challengeId={challengeId??''}/>;}
