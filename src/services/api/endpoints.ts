import { httpRequest } from './http';
import { tokenPairSchema } from './contracts';
import { setRoleSession } from '@/services/auth/session';
const segment = (value:string) => encodeURIComponent(value);
export const api = {
  requestOtp: (mobile:string) => httpRequest<void>('/api/v1/auth/otp/request',{auth:'none',method:'POST',body:{mobile}}),
  login: (body:unknown) => httpRequest<unknown>('/api/v1/auth/login',{auth:'none',method:'POST',body}),
  children: () => httpRequest<unknown>('/api/v1/children',{auth:'parent'}),
  createChild: (body:unknown) => httpRequest<unknown>('/api/v1/children',{auth:'parent',method:'POST',body}),
  childStatistics: (id:string) => httpRequest<unknown>(`/api/v1/children/${segment(id)}/statistics`,{auth:'parent'}),
  selectChild: async (id:string) => {
    const pair=await httpRequest(`/api/v1/children/${segment(id)}/select`,{auth:'parent',method:'POST'},tokenPairSchema);
    await setRoleSession('child',pair,id); return pair;
  },
  journeys: () => httpRequest<unknown>('/api/v1/child/journeys'),
  selectJourney: (id:string) => httpRequest<void>(`/api/v1/child/journeys/${segment(id)}/select`,{method:'POST'}),
  stages: (journeyId:string) => httpRequest<unknown>(`/api/v1/child/journeys/${segment(journeyId)}/stages`),
  challenges: (stageId:string) => httpRequest<unknown>(`/api/v1/child/stages/${segment(stageId)}/challenges`),
  challenge: (stageId:string, challengeId:string) => httpRequest<unknown>(`/api/v1/child/stages/${segment(stageId)}/challenges/${segment(challengeId)}`),
  activity: (stageId:string,challengeId:string,actionType:string,payload:unknown,ms:number) => httpRequest<unknown>(
    `/api/v1/child/stages/${segment(stageId)}/challenges/${segment(challengeId)}/activities`,
    {method:'POST',body:{actionType,payload,timeSpentMilliseconds:Math.max(0,Math.min(ms,3600000))}}),
  attempt: (stageId:string,challengeId:string,answer:unknown,ms:number,mistakes=0) => httpRequest<unknown>(
    `/api/v1/child/stages/${segment(stageId)}/challenges/${segment(challengeId)}/attempts`,
    {method:'POST',body:{answer,timeSpentMilliseconds:Math.max(0,Math.min(ms,3600000)),mistakeCount:Math.max(0,Math.min(mistakes,100))}}),
  result: (stageId:string) => httpRequest<unknown>(`/api/v1/child/stages/${segment(stageId)}/result`),
  leaderboard: () => httpRequest<unknown>('/api/v1/child/leaderboard'),
  publicGroup: (slug:string) => httpRequest<unknown>(`/api/v1/groups/join/${segment(slug)}`,{auth:'none'}),
  joinGroup: (slug:string,childId:string) => httpRequest<unknown>(`/api/v1/groups/join/${segment(slug)}`,{auth:'parent',method:'POST',body:{childProfileId:childId}}),
};
