import { api } from '@/services/api/endpoints';
import { childStatisticsSchema } from '../model/statistics';
export async function loadChildStatistics(childId:string) {
 return childStatisticsSchema.parse(await api.childStatistics(childId));
}
