import { api } from '@/services/api/endpoints';
import { journeyResponseSchema } from '../model/journey';
export async function listJourneys() {return journeyResponseSchema.parse(await api.journeys()).journeys;}
export async function chooseJourney(id:string) {await api.selectJourney(id);return id;}
