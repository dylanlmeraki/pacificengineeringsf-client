import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

type Payload = { doc_id: string; token?: string };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const body: Payload = await req.json();
    const { doc_id, token } = body || {} as any;
    if (!doc_id) return Response.json({ error: 'Missing doc_id' }, { status: 400 });

    const doc = await base44.asServiceRole.entities.ProjectDoc.get(doc_id);
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });

    const tokenValid = token && doc.approval_token && token === doc.approval_token && doc.approval_token_expires_at && new Date(doc.approval_token_expires_at) > new Date();
    const sessionOk = !!user && (user.role === 'admin' || user.email === doc.created_by || user.email === doc.assigned_to || user.email === doc.approver_email || user.email === doc.client_email);
    if (!tokenValid && !sessionOk) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Return safe subset
    const safe = {
      id: doc.id,
      project_id: doc.project_id,
      project_name: doc.project_name,
      title: doc.title,
      doc_type: doc.doc_type,
      doc_number: doc.doc_number,
      status: doc.status,
      due_date: doc.due_date,
      description: doc.description,
      rendered_body: doc.rendered_body,
      attachments_meta: doc.attachments_meta || [],
      approver_email: doc.approver_email,
      created_by: doc.created_by
    };
    return Response.json({ doc: safe });
  } catch (error) {
    return Response.json({ error: (error as any)?.message || 'Server error' }, { status: 500 });
  }
});