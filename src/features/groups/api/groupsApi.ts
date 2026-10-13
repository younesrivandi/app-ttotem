import { api } from '@/services/api/endpoints';
import { groupSchema } from '../model/group';
export async function getPublicGroup(slug:string){return groupSchema.parse(await api.publicGroup(slug));}
export async function joinChildToGroup(slug:string,childId:string){await api.joinGroup(slug,childId);}
