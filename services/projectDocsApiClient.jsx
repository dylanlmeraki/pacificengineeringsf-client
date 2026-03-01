import { base44 } from "@/api/base44Client";

const call = async (action, data) => {
  const res = await base44.functions.invoke('projectDocsApi', { action, data });
  return res?.data;
};

export const projectDocsApi = {
  list: async (filter = {}, sort = '-updated_date', limit = 100) => {
    const { items = [] } = await call('listDocs', { filter, sort, limit });
    return items;
  },
  get: async (id) => {
    const { doc } = await call('getDoc', { id });
    return doc;
  },
  create: async (payload) => {
    const { doc } = await call('createDoc', payload);
    return doc;
  },
  update: async (id, updates) => {
    const { doc } = await call('updateDoc', { id, updates });
    return doc;
  },
  listMessages: async (doc_id, sort = 'created_date', limit = 200) => {
    const { items = [] } = await call('listMessages', { doc_id, sort, limit });
    return items;
  },
  createMessage: async (payload) => {
    const { message } = await call('createMessage', payload);
    return message;
  },
  listTemplates: async (doc_type) => {
    const { items = [] } = await call('listTemplates', { doc_type });
    return items;
  },
  upsertTemplate: async (values, id=null) => {
    const { template } = await call('upsertTemplate', { id, values });
    return template;
  },
  bulkShare: async (ids, share) => {
    // Prefer function endpoint if available for performance; fallback to projectDocsApi action
    try {
      const res = await base44.functions.invoke('bulkShareDocs', { ids, share });
      return res?.data;
    } catch {
      return await call('bulkShare', { ids, share });
    }
  },
  bulkUpdate: async (ids, patch) => {
    return await call('bulkUpdate', { ids, patch });
  }
};