import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const o = url.searchParams.get('o');
    const t = url.searchParams.get('t');
    const u = url.searchParams.get('u');

    if (!o || !t || !u) return Response.redirect(decodeURIComponent(u || 'https://example.com'), 302);

    const base44 = createClientFromRequest(req);
    const outreach = await base44.asServiceRole.entities.SalesOutreach.get(o);
    if (outreach && outreach.tracking_token === t) {
      const click_count = (outreach.click_count || 0) + 1;
      await base44.asServiceRole.entities.SalesOutreach.update(o, { click_count, clicked: true });

      if (outreach.run_id) {
        const run = await base44.asServiceRole.entities.OutreachSequenceRun.get(outreach.run_id);
        await base44.asServiceRole.entities.OutreachSequenceRun.update(run.id, {
          analytics: { ...(run.analytics || {}), clicks: ((run.analytics?.clicks || 0) + 1) }
        });
      }
    }

    return Response.redirect(decodeURIComponent(u), 302);
  } catch (e) {
    try {
      const url = new URL(req.url);
      return Response.redirect(decodeURIComponent(url.searchParams.get('u') || 'https://example.com'), 302);
    } catch {
      return Response.redirect('https://example.com', 302);
    }
  }
});