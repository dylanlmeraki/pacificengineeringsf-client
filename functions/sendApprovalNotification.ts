import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';


function addAudit(audit, evt) {
  const list = Array.isArray(audit) ? audit.slice() : [];
  list.push({ ...evt, timestamp: new Date().toISOString() });
  return list;
}

function ttlDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

async function sendEmailWithRetry(base44, to, subject, html, cc) {
  const payload = { to, subject, body: html, from_name: 'Project Approvals' };
  let attempt = 0; let lastErr = null;
  while (attempt < 3) {
    try {
      await base44.integrations.Core.SendEmail({ ...payload, to, body: html });
      if (cc) { try { await base44.integrations.Core.SendEmail({ ...payload, to: cc, body: html }); } catch { /* ignore cc failure */ } }
      return { success: true };
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      attempt += 1;
    }
  }
  return { success: false, error: lastErr?.message || 'Email failed' };
}

Deno.serve(async (req) => {
  const correlationId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    // This function is primarily automation-invoked, but allow manual testing
    const body = await req.json().catch(() => ({}));
    console.log(JSON.stringify({ level: 'info', msg: 'sendApprovalNotification:start', correlationId, entityId: body?.event?.entity_id || body?.data?.id || body?.data?.doc_id }));
    const id = body?.event?.entity_id || body?.data?.id || body?.data?.doc_id;
    if (!id) return Response.json({ error: 'Missing document id', correlationId }, { status: 400 });

    let fresh;
    try {
      fresh = await base44.asServiceRole.entities.ProjectDoc.get(id);
    } catch (e) {
      const msg = (e && e.message) || String(e);
      const is404 = /not found|404/i.test(msg);
      return Response.json({ error: 'Not found', correlationId }, { status: is404 ? 404 : 500 });
    }

    const oldStatus = body?.old_data?.status;
    const newStatus = body?.data?.status ?? fresh.status;

    // Only on true transition into "Under Review"
    if (newStatus !== 'Under Review' || oldStatus === 'Under Review') {
      return Response.json({ skipped: true, reason: 'No transition into Under Review', correlationId });
    }

    const approver = fresh.approver_email;
    if (!approver) {
      const audit = addAudit(fresh.audit_log, { event: 'approval_request_skipped', actor: user?.email || 'system', details: { reason: 'missing_approver_email' } });
      await base44.asServiceRole.entities.ProjectDoc.update(id, { audit_log: audit });
      return Response.json({ skipped: true, reason: 'Missing approver_email', correlationId });
    }

    // Idempotency: if requested_at exists for current cycle (still Under Review) do not resend
    if (fresh.requested_at && fresh.reminder_count === 0 && fresh.last_reminded_at && fresh.approval_token) {
      return Response.json({ skipped: true, reason: 'Already requested this cycle', correlationId });
    }

    // Ensure token (reusable until status changes), 30 day expiry
    const token = fresh.approval_token && fresh.approval_token_expires_at && new Date(fresh.approval_token_expires_at) > new Date()
      ? fresh.approval_token
      : crypto.randomUUID();
    const expiresAt = ttlDays(14);

    // Build link using current host
    const origin = new URL(req.url).origin; // correlationId set above
    const link = `${origin}/#/DocApproval?doc_id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;

    const subject = `[Approval Requested] ${fresh.title || fresh.doc_number || fresh.doc_type}`;
    const accent = '#111827';
    const html = `
      <div style="font-family:Inter,Arial,Helvetica,sans-serif;padding:16px;color:#111">
        <div style="border-left:4px solid ${accent};padding-left:12px;margin-bottom:12px">
          <div style="font-size:18px;font-weight:700">Approval Requested</div>
          <div style="font-size:13px;opacity:.8">${fresh.project_name || ''}</div>
        </div>
        <div style="font-size:14px;line-height:1.6">
          <p>Please review and take action on the document below.</p>
          <p><b>Title:</b> ${fresh.title || ''}<br/>
             <b>Type:</b> ${fresh.doc_type}<br/>
             <b>Due:</b> ${fresh.due_date || '—'}</p>
          <p><a href="${link}" style="display:inline-block;background:${accent};color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Open Approval</a></p>
        </div>
      </div>`;

    console.log(JSON.stringify({ level: 'info', msg: 'sendApprovalNotification:email:send', to: approver, correlationId }));
    const emailRes = await sendEmailWithRetry(base44, approver, subject, html, fresh.created_by);

    const audit2 = addAudit(fresh.audit_log, { event: 'approval_requested', actor: user?.email || 'system', details: { email_to: approver, success: emailRes.success } });
    await base44.asServiceRole.entities.ProjectDoc.update(id, {
      approval_token: token,
      approval_token_expires_at: expiresAt,
      requested_at: new Date().toISOString(),
      last_reminded_at: new Date().toISOString(),
      reminder_count: 0,
      audit_log: audit2,
    });

    console.log(JSON.stringify({ level: 'info', msg: 'sendApprovalNotification:done', success: true, correlationId }));
    return Response.json({ success: true, email: emailRes, correlationId });
  } catch (error) {
    const errId = correlationId || crypto.randomUUID?.();
    console.log(JSON.stringify({ level: 'error', msg: 'sendApprovalNotification:error', error: (error)?.message, correlationId: errId }));
    return Response.json({ error: (error)?.message || 'Server error', correlationId: errId }, { status: 500 });
  }
});