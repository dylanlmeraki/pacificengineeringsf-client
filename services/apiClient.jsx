/**
 * Abstracted API Client for Pacific Engineering Internal Portal
 * 
 * MIGRATION LAYER: Currently wraps Base44 SDK. 
 * Post-migration: Replace internals with Axios calls to https://api.pacificengineeringsf.com
 * 
 * All frontend code should import from this file, NOT from @/api/base44Client directly.
 * This ensures a single point of change during migration.
 */

import { base44 } from "@/api/base44Client";
import { config } from "@/components/utils/envConfig";

// ============================================================================
// Provider flag — flip this to switch from Base44 SDK to REST API
// ============================================================================
const USE_BASE44 = true; // Set to false post-migration

// ============================================================================
// Future REST API base (unused while USE_BASE44 = true)
// ============================================================================
const API_BASE_URL = config.apiBaseUrl || 'https://api.pacificengineeringsf.com/api';

// ============================================================================
// Generic CRUD operations
// ============================================================================

/**
 * List entities with optional sort and limit
 * @param {string} entityName - Name of the entity (e.g., 'Prospect', 'Project')
 * @param {string} [sort] - Sort field (prefix with '-' for descending)
 * @param {number} [limit] - Max records to return
 * @returns {Promise<Array>}
 */
export async function list(entityName, sort, limit) {
  if (USE_BASE44) {
    return await base44.entities[entityName].list(sort, limit);
  }
  // POST-MIGRATION: Axios call
  // const params = {};
  // if (sort) params.sort = sort;
  // if (limit) params.limit = limit;
  // const res = await fetch(`${API_BASE_URL}/${entityName.toLowerCase()}s?${new URLSearchParams(params)}`, {
  //   credentials: 'include',
  // });
  // return res.json();
}

/**
 * Filter entities by query
 * @param {string} entityName
 * @param {Object} query - Filter criteria
 * @param {string} [sort]
 * @param {number} [limit]
 * @returns {Promise<Array>}
 */
export async function filter(entityName, query, sort, limit) {
  if (USE_BASE44) {
    return await base44.entities[entityName].filter(query, sort, limit);
  }
  // POST-MIGRATION: 
  // const res = await fetch(`${API_BASE_URL}/${entityName.toLowerCase()}s/filter`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ query, sort, limit }),
  // });
  // return res.json();
}

/**
 * Create a new entity record
 * @param {string} entityName
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function create(entityName, data) {
  if (USE_BASE44) {
    return await base44.entities[entityName].create(data);
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/${entityName.toLowerCase()}s`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return res.json();
}

/**
 * Bulk create entity records
 * @param {string} entityName
 * @param {Array<Object>} dataArray
 * @returns {Promise<Array>}
 */
export async function bulkCreate(entityName, dataArray) {
  if (USE_BASE44) {
    return await base44.entities[entityName].bulkCreate(dataArray);
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/${entityName.toLowerCase()}s/bulk`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ records: dataArray }),
  // });
  // return res.json();
}

/**
 * Update an entity record
 * @param {string} entityName
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function update(entityName, id, data) {
  if (USE_BASE44) {
    return await base44.entities[entityName].update(id, data);
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/${entityName.toLowerCase()}s/${id}`, {
  //   method: 'PUT',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return res.json();
}

/**
 * Delete an entity record
 * @param {string} entityName
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function remove(entityName, id) {
  if (USE_BASE44) {
    await base44.entities[entityName].delete(id);
    return;
  }
  // POST-MIGRATION:
  // await fetch(`${API_BASE_URL}/${entityName.toLowerCase()}s/${id}`, {
  //   method: 'DELETE',
  //   credentials: 'include',
  // });
}

/**
 * Get entity JSON schema (for dynamic forms)
 * @param {string} entityName
 * @returns {Promise<Object>}
 */
export async function schema(entityName) {
  if (USE_BASE44) {
    return await base44.entities[entityName].schema();
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/${entityName.toLowerCase()}s/schema`, {
  //   credentials: 'include',
  // });
  // return res.json();
}

/**
 * Subscribe to real-time entity changes
 * @param {string} entityName
 * @param {Function} callback - Called with { id, type, data, old_data }
 * @returns {Function} unsubscribe function
 */
export function subscribe(entityName, callback) {
  if (USE_BASE44) {
    return base44.entities[entityName].subscribe(callback);
  }
  // POST-MIGRATION: WebSocket or SSE subscription
  // const ws = new WebSocket(`wss://api.pacificengineeringsf.com/ws/${entityName.toLowerCase()}s`);
  // ws.onmessage = (event) => callback(JSON.parse(event.data));
  // return () => ws.close();
}

// ============================================================================
// Convenience: Entity-specific accessor (preserves base44.entities.X pattern)
// ============================================================================

/**
 * Creates a typed entity accessor for a given entity name.
 * Usage: const ProspectAPI = entityAccessor('Prospect');
 *        const prospects = await ProspectAPI.list('-created_date', 20);
 */
export function entityAccessor(entityName) {
  return {
    list: (sort, limit) => list(entityName, sort, limit),
    filter: (query, sort, limit) => filter(entityName, query, sort, limit),
    create: (data) => create(entityName, data),
    bulkCreate: (dataArray) => bulkCreate(entityName, dataArray),
    update: (id, data) => update(entityName, id, data),
    remove: (id) => remove(entityName, id),
    schema: () => schema(entityName),
    subscribe: (callback) => subscribe(entityName, callback),
  };
}

export default { list, filter, create, bulkCreate, update, remove, schema, subscribe, entityAccessor };