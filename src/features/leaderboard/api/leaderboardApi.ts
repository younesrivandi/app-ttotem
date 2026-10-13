import { api } from '@/services/api/endpoints';
import { rankingsSchema } from '../model/leaderboard';
export async function fetchLeaderboard(){return rankingsSchema.parse(await api.leaderboard());}
