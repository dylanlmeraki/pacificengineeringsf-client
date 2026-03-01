import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function addAudit(audit, evt) {
  const list = Array.isArray(audit) ? audit.slice() : [];
  list.push({ ...evt, timestamp: new Date().toISOString() });
  return list;
}

function hoursSince(ts) {
  if (!ts) return Infinity;
  const diff = Date.now() - new Date(ts).getTime();
  return diff / 36e5;
}

Deno.serve(async (req) => {
  const correlationId = crypto.randomUUID();
  try {
    console.log(JSON.stringify({ level: 'info', msg: 'sendOverdueReminder:start', correlationId }));
    const base44 = createClientFromRequest(req);
    // Service-role for scheduled job
    const now = new Date();

    // Pull candidates (filter then narrow in code)
    const items = await base44.asServiceRole.entities.ProjectDoc.filter({ status: 'Under Review' }, '-due_date', 500);

    const overdue = (items || []).filter((d) => d.due_date && new Date(d.due_date).getTime() < now.getTime());

    let success = 0; const failures = [];

    const chunks = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

    for (const batch of chunks(overdue, 50)) {
      await Promise.all(batch.map(async (doc) => {
        try {
          if (hoursSince(doc.last_reminded_at) < 24) return; // anti-spam
          const to = doc.approver_email;
          if (!to) {
            const audit = addAudit(doc.audit_log, { event: 'reminder_skipped', actor: 'system', details: { reason: 'missing_approver_email' } });
            await base44.asServiceRole.entities.ProjectDoc.update(doc.id, { audit_log: audit });
            return;
          }
          const origin = new URL(req.url).origin;
          const tokenValid = doc.approval_token && doc.approval_token_expires_at && new Date(doc.approval_token_expires_at) > now;
          const token = tokenValid ? doc.approval_token : crypto.randomUUID();
          const link = `${origin}/#/DocApproval?doc_id=${encodeURIComponent(doc.id)}&token=${encodeURIComponent(token)}`;
          const html = `<div style="font-family:Inter,Arial,Helvetica,sans-serif;padding:16px">
            <div style="font-weight:700">Approval Reminder</div>
            <p>${doc.project_name || ''}</p>
            <p>Document: <b>${doc.title || ''}</b><br/>Due: ${doc.due_date || '—'}</p>
            <p><a href="${link}" style="display:inline-block;background:#111827;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none">Open Approval</a></p>
          </div>`;
          // CC the creator if available
          try {
            await base44.integrations.Core.SendEmail({ to, subject: `[Reminder] ${doc.title || doc.doc_type}`, body: html });
            if (doc.created_by) {
              try { await base44.integrations.Core.SendEmail({ to: doc.created_by, subject: `[FYI] Approval reminder sent for ${doc.title || doc.doc_type}` , body: html }); } catch {}
            }
          } catch (e) {
            // let catch finalize in outer block
            throw e;
          }

          const audit = addAudit(doc.audit_log, { event: 'reminder_sent', actor: 'system', details: { to, cc: doc.created_by || null } });
          await base44.asServiceRole.entities.ProjectDoc.update(doc.id, {
            approval_token: token,
            approval_token_expires_at: new Date(Date.now() + 14*24*60*60*1000).toISOString(),
            last_reminded_at: new Date().toISOString(),
            reminder_count: (doc.reminder_count || 0) + 1,
            audit_log: audit
          });
          success += 1;
        } catch (e) {
          failures.push({ id: doc.id, reason: (e)?.message || 'send failed' });
        }
      }));
    }

    console.log(JSON.stringify({ level: 'info', msg: 'sendOverdueReminder:done', success, failures_count: failures.length, correlationId }));
    return Response.json({ success, failures, correlationId });
  } catch (error) {
    const errId = correlationId || crypto.randomUUID?.();
    return Response.json({ error: (error)?.message || 'Server error', correlationId: errId }, { status: 500 });
  }
});