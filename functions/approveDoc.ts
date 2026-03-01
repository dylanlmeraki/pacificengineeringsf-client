import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

type Payload = { doc_id: string; action: 'approve'|'reject'; token?: string; reason?: string };

function addAudit(audit: any[] | undefined, evt: any) {
  const list = Array.isArray(audit) ? audit.slice() : [];
  list.push({ ...evt, timestamp: new Date().toISOString() });
  return list;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const body: Payload = await req.json();
    const { doc_id, action, token, reason } = body || {} as any;
    if (!doc_id || !action) return Response.json({ error: 'Missing params' }, { status: 400 });

    const doc = await base44.asServiceRole.entities.ProjectDoc.get(doc_id);
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });

    const isSessionAllowed = !!user && (user.role === 'admin' || user.email === doc.created_by || user.email === doc.assigned_to || user.email === doc.approver_email || user.email === doc.client_email);

    const tokenValid = token && doc.approval_token && token === doc.approval_token && doc.approval_token_expires_at && new Date(doc.approval_token_expires_at) > new Date();

    if (!isSessionAllowed && !tokenValid) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (doc.status !== 'Under Review') {
      return Response.json({ error: 'Document not awaiting approval' }, { status: 400 });
    }

    const actor = user?.email || 'token';

    if (action === 'approve') {
      const audit = addAudit(doc.audit_log, { event: 'approved', actor });
      const updated = await base44.asServiceRole.entities.ProjectDoc.update(doc_id, {
        status: 'approved',
        approved_by: actor,
        approved_at: new Date().toISOString(),
        audit_log: audit,
        // end cycle
        approval_token: null,
        approval_token_expires_at: null
      });
      return Response.json({ success: true, doc: updated });
    }

    if (action === 'reject') {
      if (!reason) return Response.json({ error: 'Rejection reason required' }, { status: 400 });
      const audit = addAudit(doc.audit_log, { event: 'rejected', actor, details: { reason } });
      const updated = await base44.asServiceRole.entities.ProjectDoc.update(doc_id, {
        status: 'rejected',
        rejected_by: actor,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        audit_log: audit,
        approval_token: null,
        approval_token_expires_at: null
      });
      return Response.json({ success: true, doc: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: (error as any)?.message || 'Server error' }, { status: 500 });
  }
});