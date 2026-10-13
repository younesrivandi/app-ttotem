import { z } from 'zod';
import { api } from '@/services/api/endpoints';
import { childSchema, childrenSchema, type Child, type CreateChildPayload } from '../model/child';

/** The API may return a bare list or a paginated/enveloped list. */
function unwrapChildren(response: unknown): unknown {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== 'object') return response;
  const body = response as Record<string, unknown>;
  for (const field of ['data', 'items', 'children', 'results']) {
    const candidate = body[field];
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      for (const nestedField of ['items', 'children', 'results', 'data']) {
        if (Array.isArray(nested[nestedField])) return nested[nestedField];
      }
    }
  }
  return response;
}

export async function listChildren(): Promise<Child[]> {
  const response = await api.children();
  const parsed = childrenSchema.safeParse(unwrapChildren(response));
  if (!parsed.success) {
    // Avoid exposing raw API response or credentials in logs.
    throw new Error('ساختار فهرست کودکان با اطلاعات مورد انتظار برنامه مطابقت ندارد.');
  }
  return parsed.data;
}

export async function createChild(payload: CreateChildPayload): Promise<Child> {
  const response = await api.createChild(payload);
  const body = response && typeof response === 'object' && !Array.isArray(response)
    ? response as Record<string, unknown>
    : null;
  return childSchema.parse(body?.data ?? response);
}

export async function chooseChild(childId: string) {
  return api.selectChild(childId);
}
