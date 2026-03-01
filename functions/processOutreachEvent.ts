import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // This function will be invoked by automation with payload: { event, data, old_data }
    const payload = await req.json();
    const data = payload?.data;
    if (!data) return Response.json({ success: true });

    const outreach = data; // SalesOutreach record
    if (!outreach.run_id) return Response.json({ success: true });

    const run = await base44.asServiceRole.entities.OutreachSequenceRun.get(outreach.run_id);
    if (!run || run.status !== 'active') return Response.json({ success: true });

    const sequence = await base44.asServiceRole.entities.EmailSequence.get(run.sequence_id);
    const idx = outreach.step_index ?? run.current_step_index;
    const step = sequence?.steps?.[idx];
    if (!step || !Array.isArray(step.branching_rules)) return Response.json({ success: true });

    // Determine event
    const events = [];
    if (outreach.opened) events.push('opened');
    if (outreach.clicked) events.push('clicked');
    if (outreach.replied) events.push('replied');

    let targetIndex = null;
    for (const ev of events) {
      const rule = step.branching_rules.find(r => r.on_event === ev);
      if (rule) { targetIndex = rule.go_to_step_index; break; }
    }

    // Handle no_reply_days rules (scheduled advancement)
    if (targetIndex === null) {
      const noReplyRule = step.branching_rules.find(r => r.on_event === 'no_reply_days');
      if (noReplyRule && typeof noReplyRule.after_days === 'number') {
        // Only advance if reply still false after X days
        const sentAt = new Date(outreach.sent_date || Date.now());
        const due = new Date(sentAt.getTime() + noReplyRule.after_days * 24 * 3600 * 1000);
        if (Date.now() >= due.getTime() && !outreach.replied) {
          targetIndex = noReplyRule.go_to_step_index;
        }
      }
    }

    if (targetIndex !== null && targetIndex !== run.current_step_index) {
      await base44.asServiceRole.entities.OutreachSequenceRun.update(run.id, { current_step_index: targetIndex, last_action_date: new Date().toISOString() });
      await base44.asServiceRole.functions.invoke('queueNextOutreachStep', { run_id: run.id });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});