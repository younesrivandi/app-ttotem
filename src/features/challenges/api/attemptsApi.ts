import { api } from '@/services/api/endpoints';
import type { AttemptPayload,ServerFeedback } from '../engine';
/** The legacy server owns score, success and next challenge selection. */
export async function submitAttempt(stageId:string,challengeId:string,payload:AttemptPayload):Promise<ServerFeedback>{
 const response=await api.attempt(stageId,challengeId,payload.answer,payload.timeSpentMilliseconds,payload.mistakeCount);
 if(typeof response!=='object'||response===null||!('isCorrect' in response)||typeof response.isCorrect!=='boolean')throw new Error('Invalid attempt feedback');
 const next='nextChallengeId' in response?response.nextChallengeId:undefined;
 if(next!==undefined&&next!==null&&typeof next!=='string'&&typeof next!=='number')throw new Error('Invalid next challenge identifier');
 return {isCorrect:response.isCorrect,nextChallengeId:next==null?undefined:String(next)};
}
