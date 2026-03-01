import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function hoursBetween(a, b) {
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  if (!t1 || !t2) return null;
  return Math.max(0, (t2 - t1) / (1000 * 60 * 60));
}

function percentile(arr, p) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((x, y) => x - y);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sequence_id, step_index } = body || {};
    if (!sequence_id || step_index === undefined) {
      return Response.json({ error: 'sequence_id and step_index required' }, { status: 400 });
    }

    // Look at this step's sends and subsequent engagement times
    const outreach = await base44.entities.SalesOutreach.filter({ sequence_id, step_index }, '-sent_date', 5000);
    const openHours = [];
    const replyHours = [];
    for (const r of outreach) {
      if (r.sent_date && r.opened && r.open_count > 0) {
        const h = hoursBetween(r.sent_date, r.updated_date || r.sent_date);
        if (h != null) openHours.push(h);
      }
      if (r.sent_date && r.replied && r.reply_date) {
        const h = hoursBetween(r.sent_date, r.reply_date);
        if (h != null) replyHours.push(h);
      }
    }

    const openP50 = percentile(openHours, 50) ?? 24;
    const openP80 = percentile(openHours, 80) ?? 72;
    const replyP50 = percentile(replyHours, 50) ?? 48;

    const recommendation = {
      delay_mode: 'engagement_dynamic',
      min_delay_hours: Math.max(12, Math.round(openP50)),
      max_delay_hours: Math.max(24, Math.round(openP80)),
      notes: 'Derived from observed engagement time distribution.'
    };

    const branching_rules = [
      { on_event: 'opened', go_to_step_index: (typeof step_index === 'number' ? step_index + 1 : 1), after_days: 1 },
      { on_event: 'replied', go_to_step_index: null, fallback: false }
    ];

    return Response.json({ recommendation, branching_rules, stats: { openP50, openP80, replyP50, samples: outreach.length } });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});