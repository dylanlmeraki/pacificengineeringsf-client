/**
 * Abstracted Backend Functions Client for Pacific Engineering Internal Portal
 * 
 * MIGRATION LAYER: Currently wraps Base44 SDK functions.invoke().
 * Post-migration: Replace with direct HTTP calls to Express API routes at
 * https://api.pacificengineeringsf.com/api/functions/{functionName}
 * 
 * All frontend code should import from this file, NOT call base44.functions directly.
 */

import { base44 } from "@/api/base44Client";
import { config } from "@/components/utils/envConfig";

// ============================================================================
// Provider flag
// ============================================================================
const USE_BASE44 = true;

const API_BASE_URL = config.apiBaseUrl || 'https://api.pacificengineeringsf.com/api';

/**
 * Invoke a backend function by name with a payload
 * @param {string} name - Function name (e.g., 'generateProjectReport')
 * @param {Object} payload - Data to send to the function
 * @returns {Promise<Object>} Function response
 */
export async function invoke(name, payload) {
  if (USE_BASE44) {
    return await base44.functions.invoke(name, payload);
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/functions/${name}`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload || {}),
  // });
  // if (!res.ok) {
  //   const err = await res.json().catch(() => ({ error: 'Function call failed' }));
  //   throw new Error(err.error || `Function ${name} failed`);
  // }
  // const contentType = res.headers.get('content-type');
  // if (contentType && contentType.includes('application/json')) {
  //   return { data: await res.json() };
  // }
  // return { data: await res.blob() };
}

/**
 * Invoke a function and return raw response (for binary data like PDFs)
 * @param {string} name
 * @param {Object} payload
 * @returns {Promise<{data: Blob, headers: Object}>}
 */
export async function invokeRaw(name, payload) {
  if (USE_BASE44) {
    // Base44 functions.invoke returns { data } — for binary, same call
    return await base44.functions.invoke(name, payload);
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/functions/${name}`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload || {}),
  // });
  // if (!res.ok) throw new Error(`Function ${name} failed`);
  // return {
  //   data: await res.blob(),
  //   headers: Object.fromEntries(res.headers.entries()),
  // };
}

export default { invoke, invokeRaw };