import { useLocalSearchParams } from 'expo-router';
import { JourneyStagesScreen } from '@/features/stages/screens/JourneyStagesScreen';
export default function Page(){const {journeyId}=useLocalSearchParams<{journeyId:string}>();return <JourneyStagesScreen journeyId={journeyId??''}/>;}
