import { base44 } from "@/api/base44Client";

// Wrapper for backend functions; later point to your Node/Express endpoints
export async function invoke(name: string, payload?: any) {
  try {
    const res = await base44.functions.invoke(name, payload);
    return res;
  } catch (err: any) {
    console.error(`[functionsClient.invoke] ${name} failed`, err);
    throw new Error(err?.message || `Function ${name} failed`);
  }
}

export default { invoke };