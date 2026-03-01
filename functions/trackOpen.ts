import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// 1x1 transparent PNG
const pixel = new Uint8Array([
  137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,
  0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,
  10,73,68,65,84,120,156,99,96,0,0,0,2,0,1,226,33,
  191,161,0,0,0,0,73,69,78,68,174,66,96,130
]);

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const o = url.searchParams.get('o');
    const t = url.searchParams.get('t');
    if (!o || !t) return new Response(pixel, { status: 200, headers: { 'Content-Type': 'image/png' } });

    const base44 = createClientFromRequest(req);
    const outreach = await base44.asServiceRole.entities.SalesOutreach.get(o);
    if (!outreach || outreach.tracking_token !== t) {
      return new Response(pixel, { status: 200, headers: { 'Content-Type': 'image/png' } });
    }

    const open_count = (outreach.open_count || 0) + 1;
    const updates = { open_count, opened: true };
    await base44.asServiceRole.entities.SalesOutreach.update(o, updates);

    // Optionally update run analytics
    if (outreach.run_id) {
      const run = await base44.asServiceRole.entities.OutreachSequenceRun.get(outreach.run_id);
      await base44.asServiceRole.entities.OutreachSequenceRun.update(run.id, {
        analytics: { ...(run.analytics || {}), opens: ((run.analytics?.opens || 0) + 1) }
      });
    }

    return new Response(pixel, { status: 200, headers: { 'Content-Type': 'image/png' } });
  } catch (_) {
    return new Response(pixel, { status: 200, headers: { 'Content-Type': 'image/png' } });
  }
});