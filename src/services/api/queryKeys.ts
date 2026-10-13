export const queryKeys = {
  children: ['children'] as const,
  childStatistics:(childId:string)=>['children',childId,'statistics'] as const,
  journeys:(childId:string)=>['child',childId,'journeys'] as const,
  stages:(childId:string,journeyId:string)=>['child',childId,'journeys',journeyId,'stages'] as const,
  challenges:(childId:string,stageId:string)=>['child',childId,'stages',stageId,'challenges'] as const,
  leaderboard:(childId:string)=>['child',childId,'leaderboard'] as const,
};
