import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { approval_id } = await req.json();
    if (!approval_id) return Response.json({ error: 'approval_id required' }, { status: 400 });

    const approval = await base44.entities.OutreachApproval.get(approval_id);
    if (approval.status !== 'pending' && approval.status !== 'approved') {
      return Response.json({ error: 'Approval not pending' }, { status: 400 });
    }

    const run = await base44.entities.OutreachSequenceRun.get(approval.run_id);
    const prospect = await base44.entities.Prospect.get(approval.prospect_id);

    // Prepare tracking + SalesOutreach record
    const run = await base44.entities.OutreachSequenceRun.get(approval.run_id);
    const sequence = await base44.entities.EmailSequence.get(run.sequence_id);
    const trackingDomain = run.tracking_domain || sequence.default_tracking_domain || '';

    // Create SalesOutreach first to get id
    const trackingToken = crypto.randomUUID();
    const outreach = await base44.entities.SalesOutreach.create({
      prospect_id: approval.prospect_id,
      prospect_name: prospect.contact_name,
      company_name: prospect.company_name,
      sequence_id: run.sequence_id,
      run_id: run.id,
      step_index: approval.step_index,
      ab_variant: (run.ab_variants && run.ab_variants[String(approval.step_index)]) || undefined,
      email_type: 'Custom',
      email_subject: approval.subject,
      email_body: approval.body_html,
      email_template_used: 'sequence',
      sent_date: new Date().toISOString(),
      opened: false,
      replied: false,
      outcome: 'Sent',
      tracking_token: trackingToken
    });

    // Inject tracking pixel and rewrite links if trackingDomain present
    let finalBody = approval.body_html || '';
    if (trackingDomain) {
      const pixelUrl = `${trackingDomain.replace(/\/$/, '')}/functions/trackOpen?o=${outreach.id}&t=${trackingToken}`;
      const pixelTag = `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt=""/>`;
      finalBody += `\n${pixelTag}`;
      // Rewrite links
      finalBody = finalBody.replace(/href=\"([^\"]+)\"/g, (m, url) => {
        const redirect = `${trackingDomain.replace(/\/$/, '')}/functions/trackClick?o=${outreach.id}&t=${trackingToken}&u=${encodeURIComponent(url)}`;
        return `href=\"${redirect}\"`;
      });
    }

    // Send email via platform (fallback path). You can switch by approval.send_via if needed.
    await base44.integrations.Core.SendEmail({
      to: prospect.contact_email,
      subject: approval.subject,
      body: finalBody
    });

    // Mark approval as sent and advance the run
    await base44.entities.OutreachApproval.update(approval.id, { status: 'sent' });

    const nextIndex = (run.current_step_index || 0) + 1;
    await base44.entities.OutreachSequenceRun.update(run.id, {
      current_step_index: nextIndex,
      last_action_date: new Date().toISOString()
    });

    // Queue next step if any
    const queueRes = await base44.functions.invoke('queueNextOutreachStep', { run_id: run.id });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});