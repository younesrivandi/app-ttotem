import { api } from '@/services/api/endpoints';
import { childSchema,childrenSchema,type Child,type CreateChildPayload } from '../model/child';
export async function listChildren():Promise<Child[]> {return childrenSchema.parse(await api.children());}
export async function createChild(payload:CreateChildPayload):Promise<Child> {return childSchema.parse(await api.createChild(payload));}
export async function chooseChild(childId:string) {return api.selectChild(childId);}
