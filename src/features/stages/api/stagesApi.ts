import { api } from '@/services/api/endpoints';
import { stagesResponseSchema } from '../model/stages';
import { challengesResponseSchema } from '../model/challenges';
export async function getJourneyStages(journeyId:string){return stagesResponseSchema.parse(await api.stages(journeyId));}
export async function getStageChallenges(stageId:string){return challengesResponseSchema.parse(await api.challenges(stageId));}
