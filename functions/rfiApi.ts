import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, data = {} } = body || {};

    const ensureOwnedOrAdmin = (record) => {
      if (user.role === 'admin') return true;
      if (record?.created_by === user.email) return true;
      if (record?.assigned_to && record.assigned_to === user.email) return true;
      if (record?.client_email && record.client_email === user.email) return true;
      return false;
    };

    if (action === 'listRFIs') {
      const { filter = {}, sort = '-updated_date', limit = 100 } = data;
      const items = await base44.entities.RFI.filter(filter, sort, limit);
      return Response.json({ items });
    }

    if (action === 'getRFI') {
      const { id } = data;
      const rfi = await base44.entities.RFI.get(id);
      if (!ensureOwnedOrAdmin(rfi)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      return Response.json({ rfi });
    }

    if (action === 'createRFI') {
      const payload = data;
      const created = await base44.entities.RFI.create(payload);
      return Response.json({ rfi: created });
    }

    if (action === 'updateRFI') {
      const { id, updates } = data;
      const existing = await base44.entities.RFI.get(id);
      if (!ensureOwnedOrAdmin(existing)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const updated = await base44.entities.RFI.update(id, updates);
      return Response.json({ rfi: updated });
    }

    if (action === 'listMessages') {
      const { rfi_id, sort = 'created_date', limit = 200 } = data;
      const items = await base44.entities.RFIMessage.filter({ rfi_id }, sort, limit);
      return Response.json({ items });
    }

    if (action === 'createMessage') {
      const payload = data;
      const created = await base44.entities.RFIMessage.create(payload);
      return Response.json({ message: created });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});