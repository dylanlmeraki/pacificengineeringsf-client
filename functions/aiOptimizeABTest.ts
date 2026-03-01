import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function rate(n, d) { return d > 0 ? n / d : 0; }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sequence_id, step_index, ab_metric = 'replies' } = body || {};
    if (!sequence_id || step_index === undefined) {
      return Response.json({ error: 'sequence_id and step_index required' }, { status: 400 });
    }

    const records = await base44.entities.SalesOutreach.filter({ sequence_id, step_index }, '-sent_date', 5000);
    const agg = { A: { sent: 0, opens: 0, clicks: 0, replies: 0 }, B: { sent: 0, opens: 0, clicks: 0, replies: 0 } };
    for (const r of records) {
      const v = (r.ab_variant === 'B') ? 'B' : 'A';
      agg[v].sent += 1;
      if (r.opened) agg[v].opens += 1;
      if (r.clicked) agg[v].clicks += 1;
      if (r.replied) agg[v].replies += 1;
    }
    const metrics = {
      A: { openRate: rate(agg.A.opens, agg.A.sent), clickRate: rate(agg.A.clicks, agg.A.sent), replyRate: rate(agg.A.replies, agg.A.sent), sent: agg.A.sent },
      B: { openRate: rate(agg.B.opens, agg.B.sent), clickRate: rate(agg.B.clicks, agg.B.sent), replyRate: rate(agg.B.replies, agg.B.sent), sent: agg.B.sent }
    };

    const key = ab_metric === 'opens' ? 'openRate' : ab_metric === 'clicks' ? 'clickRate' : 'replyRate';
    let winner = null;
    if (metrics.A.sent >= 30 || metrics.B.sent >= 30) {
      winner = metrics.A[key] >= metrics.B[key] ? 'A' : 'B';
    }

    return Response.json({ metrics, winner, recommendation: winner ? { use: winner, split: winner === 'A' ? 80 : 20 } : { use: 'collect_more_data' } });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});