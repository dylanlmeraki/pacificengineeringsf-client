import { base44 } from "@/api/base44Client";

// Generic typed API wrapper over Base44 entities to ease migration later
// Swap implementations here to point to your Node/Express API without touching pages
export type SortOrder = string | undefined;

export async function list<T = any>(entityName: string, sort?: SortOrder, limit?: number): Promise<T[]> {
  try {
    // Base44 list accepts (sort, limit)
    // @ts-ignore - dynamic entity access
    return await base44.entities[entityName].list(sort, limit);
  } catch (err: any) {
    console.error(`[apiClient.list] ${entityName} failed`, err);
    throw new Error(err?.message || `Failed to list ${entityName}`);
  }
}

export async function filter<T = any>(entityName: string, query: Record<string, any>, sort?: SortOrder, limit?: number): Promise<T[]> {
  try {
    // @ts-ignore
    return await base44.entities[entityName].filter(query, sort, limit);
  } catch (err: any) {
    console.error(`[apiClient.filter] ${entityName} failed`, err);
    throw new Error(err?.message || `Failed to filter ${entityName}`);
  }
}

export async function create<T = any>(entityName: string, data: Record<string, any>): Promise<T> {
  try {
    // @ts-ignore
    return await base44.entities[entityName].create(data);
  } catch (err: any) {
    console.error(`[apiClient.create] ${entityName} failed`, err);
    throw new Error(err?.message || `Failed to create ${entityName}`);
  }
}

export async function update<T = any>(entityName: string, id: string, data: Record<string, any>): Promise<T> {
  try {
    // @ts-ignore
    return await base44.entities[entityName].update(id, data);
  } catch (err: any) {
    console.error(`[apiClient.update] ${entityName} failed`, err);
    throw new Error(err?.message || `Failed to update ${entityName}`);
  }
}

export async function remove(entityName: string, id: string): Promise<void> {
  try {
    // @ts-ignore
    await base44.entities[entityName].delete(id);
  } catch (err: any) {
    console.error(`[apiClient.delete] ${entityName} failed`, err);
    throw new Error(err?.message || `Failed to delete from ${entityName}`);
  }
}

export default {
  list,
  filter,
  create,
  update,
  remove,
};