import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function interpolate(text, data) {
  return (text || '').replace(/{{\s*(\w+)\s*}}/g, (_, key) => (data?.[key] ?? ''));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sequence_id, prospect_ids = [], tracking_domain, ab_metric, ab_split_percent, dynamic_delay_enabled } = await req.json();
    if (!sequence_id || !Array.isArray(prospect_ids) || prospect_ids.length === 0) {
      return Response.json({ error: 'sequence_id and prospect_ids required' }, { status: 400 });
    }

    const sequence = await base44.entities.EmailSequence.get(sequence_id);

    const createdRuns = [];
    for (const pid of prospect_ids) {
      const prospect = await base44.entities.Prospect.get(pid);
      const run = await base44.entities.OutreachSequenceRun.create({
        prospect_id: pid,
        prospect_name: prospect.contact_name,
        company_name: prospect.company_name,
        sequence_id,
        current_step_index: 0,
        status: 'active',
        assigned_to: user.email,
        tracking_domain: tracking_domain || sequence.default_tracking_domain || null,
        ab_metric: ab_metric || sequence.ab_metric || 'opens',
        ab_split_percent: typeof ab_split_percent === 'number' ? ab_split_percent : (sequence.ab_split_percent ?? 50),
        dynamic_delay_enabled: Boolean(dynamic_delay_enabled)
      });
      // Queue first step immediately (delay handled in queue function)
      await base44.functions.invoke('queueNextOutreachStep', { run_id: run.id });
      createdRuns.push(run);
    }

    return Response.json({ success: true, count: createdRuns.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});