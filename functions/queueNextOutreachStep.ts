import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString();
}

function interpolate(text, data) {
  return (text || '').replace(/{{\s*(\w+)\s*}}/g, (_, key) => (data?.[key] ?? ''));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { run_id } = await req.json();
    if (!run_id) return Response.json({ error: 'run_id required' }, { status: 400 });

    const run = await base44.entities.OutreachSequenceRun.get(run_id);
    const sequence = await base44.entities.EmailSequence.get(run.sequence_id);

    if (!sequence.active || run.status !== 'active') {
      return Response.json({ success: false, reason: 'inactive' });
    }

    if (run.current_step_index >= sequence.steps.length) {
      await base44.entities.OutreachSequenceRun.update(run.id, { status: 'completed' });
      return Response.json({ success: true, completed: true });
    }

    const step = sequence.steps[run.current_step_index];

    // Choose template (supports A/B)
    let chosenTemplateId = step.template_id;
    let abVariant = null;
    if (step.ab_enabled && Array.isArray(step.ab_template_ids) && step.ab_template_ids.length === 2) {
      // Use stored choice if exists, otherwise assign based on split
      const existingVariant = (run.ab_variants && run.ab_variants[String(run.current_step_index)]) || null;
      if (existingVariant) {
        abVariant = existingVariant;
      } else {
        const split = typeof run.ab_split_percent === 'number' ? run.ab_split_percent : (sequence.ab_split_percent ?? 50);
        const roll = Math.random() * 100;
        abVariant = roll < split ? 'A' : 'B';
        const map = Object.assign({}, run.ab_variants || {});
        map[String(run.current_step_index)] = abVariant;
        await base44.entities.OutreachSequenceRun.update(run.id, { ab_variants: map });
      }
      chosenTemplateId = abVariant === 'B' ? step.ab_template_ids[1] : step.ab_template_ids[0];
    }

    const template = await base44.entities.EmailTemplate.get(chosenTemplateId);

    const prospect = await base44.entities.Prospect.get(run.prospect_id);
    const data = {
      contact_name: prospect.contact_name,
      company_name: prospect.company_name,
      email: prospect.contact_email,
    };

    const subject = interpolate(template.subject, data);
    const body_html = interpolate(template.body_html, data);

    // Compute delay
    let scheduledSendISO;
    if ((step.delay_mode === 'engagement_dynamic') || run.dynamic_delay_enabled) {
      // Simple heuristic: if recent interaction in last 3 days -> min delay, else max
      const interactions = await base44.entities.Interaction.filter({ prospect_id: run.prospect_id }, '-interaction_date', 10);
      const recent = (interactions || []).some(i => (new Date(i.interaction_date)) > new Date(Date.now() - 3 * 24 * 3600 * 1000));
      const hours = recent ? (step.min_delay_hours ?? 0) : (step.max_delay_hours ?? 24);
      const dt = new Date(Date.now() + (hours * 3600 * 1000));
      scheduledSendISO = dt.toISOString();
    } else {
      scheduledSendISO = addDays(new Date(), step.delay_days || 0);
    }

    const approval = await base44.entities.OutreachApproval.create({
      run_id: run.id,
      prospect_id: run.prospect_id,
      step_index: run.current_step_index,
      subject,
      body_html,
      send_via: step.send_via || 'platform',
      status: 'pending',
      scheduled_send_at: scheduledSendISO
    });

    // Create a Task for approval
    await base44.entities.Task.create({
      prospect_id: run.prospect_id,
      prospect_name: prospect.contact_name,
      company_name: prospect.company_name,
      task_type: 'Follow-up Email',
      title: `[Approve Email] ${subject}`,
      description: 'Review and approve the next outreach email. Upon approval, the system will send and queue the following step per sequence.',
      priority: 'Medium',
      status: 'Pending',
      due_date: scheduledSendISO,
      assigned_to: user.email,
      automated: true,
      notes: `OutreachApproval:${approval.id}`
    });

    return Response.json({ success: true, approval_id: approval.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});