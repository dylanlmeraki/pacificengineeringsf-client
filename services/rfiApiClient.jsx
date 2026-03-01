import { base44 } from "@/api/base44Client";

const call = async (action, data) => {
  const res = await base44.functions.invoke('rfiApi', { action, data });
  return res?.data;
};

export const rfiApi = {
  list: async (filter = {}, sort = '-updated_date', limit = 100) => {
    const { items = [] } = await call('listRFIs', { filter, sort, limit });
    return items;
  },
  get: async (id) => {
    const { rfi } = await call('getRFI', { id });
    return rfi;
  },
  create: async (payload) => {
    const { rfi } = await call('createRFI', payload);
    return rfi;
  },
  update: async (id, updates) => {
    const { rfi } = await call('updateRFI', { id, updates });
    return rfi;
  },
  listMessages: async (rfi_id, sort = 'created_date', limit = 200) => {
    const { items = [] } = await call('listMessages', { rfi_id, sort, limit });
    return items;
  },
  createMessage: async (payload) => {
    const { message } = await call('createMessage', payload);
    return message;
  }
};