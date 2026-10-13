import {api} from '@/services/api/endpoints';
import {stageResultSchema} from '../model/stageResult';
export async function getStageResult(stageId:string){return stageResultSchema.parse(await api.result(stageId));}
