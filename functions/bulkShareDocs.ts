import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

type BulkSharePayload = {
  ids: string[];
  share: boolean;
};

type Result = {
  updated: number;
  failures: { id: string; reason: string }[];
};

Deno.serve(async (req) => {
  const correlationId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized', correlationId }, { status: 401 });

    const body: BulkSharePayload = await req.json();
    console.log(JSON.stringify({ level: 'info', msg: 'bulkShareDocs:start', correlationId, ids_count: Array.isArray(body?.ids) ? body.ids.length : 0, share: body?.share }));
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    const share = body?.share;

    const SAFE_MAX = 200;
    if (!ids.length) return Response.json({ error: 'No ids provided', correlationId }, { status: 400 });
    if (ids.length > SAFE_MAX) return Response.json({ error: `Too many ids (max ${SAFE_MAX})`, correlationId }, { status: 400 });
    if (typeof share !== 'boolean') return Response.json({ error: 'share must be boolean', correlationId }, { status: 400 });

    const ensureOwnedOrAdmin = (record: any) => {
      if (user.role === 'admin') return true;
      if (record?.created_by === user.email) return true;
      if (record?.assigned_to && record.assigned_to === user.email) return true;
      if (record?.client_email && record.client_email === user.email) return true;
      return false;
    };

    const res: Result = { updated: 0, failures: [] };

    for (const id of ids) {
      try {
        const existing = await base44.entities.ProjectDoc.get(id);
        if (!existing) { res.failures.push({ id, reason: 'Not found' }); continue; }
        if (!ensureOwnedOrAdmin(existing)) { res.failures.push({ id, reason: 'Forbidden' }); continue; }

        const patch = { is_shared_with_client: share } as any;
        const updated = await base44.entities.ProjectDoc.update(id, patch);
        res.updated += 1;

        await base44.entities.AuditLog.create({
          actor_email: user.email,
          actor_name: user.full_name,
          action: share ? 'projectdoc_shared' : 'projectdoc_unshared',
          resource_type: 'ProjectDoc',
          resource_id: id,
          resource_name: updated?.title || updated?.doc_number || 'Document',
          details: JSON.stringify({ before: { is_shared_with_client: existing.is_shared_with_client }, after: { is_shared_with_client: share } })
        });
      } catch (e) {
        res.failures.push({ id, reason: (e as any)?.message || 'Update failed' });
      }
    }

    console.log(JSON.stringify({ level: 'info', msg: 'bulkShareDocs:done', updated: res.updated, failures: res.failures.length, correlationId }));
    return Response.json({ ...res, correlationId });
  } catch (error) {
    const errId = correlationId || crypto.randomUUID?.();
    console.log(JSON.stringify({ level: 'error', msg: 'bulkShareDocs:error', error: (error as any)?.message, correlationId: errId }));
    return Response.json({ error: (error as any)?.message || 'Server error', correlationId: errId }, { status: 500 });
  }
});