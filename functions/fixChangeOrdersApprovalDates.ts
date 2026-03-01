import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Try to read payload, but allow empty
    const _ = await req.json().catch(() => ({}));

    // Service role sweep of approved COs missing approval date
    const approved = await base44.asServiceRole.entities.ChangeOrder.filter({ status: 'Approved' }, '-updated_date', 1000);

    let updated = 0;
    for (const co of approved || []) {
      if (!co.client_approval_date) {
        const dateIso = co.updated_date || co.created_date || new Date().toISOString();
        await base44.asServiceRole.entities.ChangeOrder.update(co.id, {
          client_approval_date: dateIso,
        });
        updated += 1;
      }
    }

    return Response.json({ success: true, scanned: (approved || []).length, updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});