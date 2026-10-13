import {Redirect,useLocalSearchParams} from 'expo-router';
/** Legacy result URL opens the completed-stage sheet on the stage route. */
export default function Result(){const {stageId}=useLocalSearchParams<{stageId:string}>();return <Redirect href={{pathname:'/stages/[stageId]',params:{stageId:stageId??'',result:'1'}}}/>;}
