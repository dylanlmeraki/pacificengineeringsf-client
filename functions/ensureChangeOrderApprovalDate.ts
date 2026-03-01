import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const event = payload?.event || null;
    const data = payload?.data || null;

    // Guard: only act on ChangeOrder entity events
    if (event?.entity_name && event.entity_name !== 'ChangeOrder') {
      return Response.json({ updated: false, reason: 'not_change_order' });
    }

    const entityId = event?.entity_id || data?.id;

    if (!data || !entityId) {
      return Response.json({ updated: false, reason: 'missing_data_or_id' });
    }

    // If status is Approved and client_approval_date is missing, set it now.
    if (data.status === 'Approved' && !data.client_approval_date) {
      const nowIso = new Date().toISOString();
      await base44.asServiceRole.entities.ChangeOrder.update(entityId, {
        client_approval_date: nowIso,
      });
      return Response.json({ updated: true, entity_id: entityId, client_approval_date: nowIso });
    }

    return Response.json({ updated: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});