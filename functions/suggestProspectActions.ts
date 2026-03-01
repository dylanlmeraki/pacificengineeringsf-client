import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function pickBestSequence(perf) {
  // Choose highest reply rate, then open rate
  const ranked = [...perf].sort((a, b) => (b.totals.replyRate - a.totals.replyRate) || (b.totals.openRate - a.totals.openRate));
  return ranked[0]?.sequence_id || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetProspectId = body?.prospect_id || null;

    // Load recent sequence performance to guide recommendations
    const perfLogs = await base44.entities.SequenceOptimizationLog.filter({ log_type: 'performance_analysis' }, '-created_date', 500);
    const latestBySeq = new Map();
    for (const log of perfLogs) {
      if (!latestBySeq.has(log.sequence_id)) latestBySeq.set(log.sequence_id, log.details);
    }
    const perfArray = Array.from(latestBySeq.values());
    const bestSeqId = pickBestSequence(perfArray);

    // Gather prospects (optionally single prospect)
    const prospects = targetProspectId
      ? (await base44.entities.Prospect.filter({ id: targetProspectId }, undefined, 1))
      : (await base44.entities.Prospect.filter({}, '-updated_date', 500));

    // Preload active runs for quick lookup (optionally single prospect)
    const runs = targetProspectId
      ? (await base44.entities.OutreachSequenceRun.filter({ status: 'active', prospect_id: targetProspectId }, '-updated_date', 300))
      : (await base44.entities.OutreachSequenceRun.filter({ status: 'active' }, '-updated_date', 1000));
    const runsByProspect = runs.reduce((m, r) => {
      if (!m[r.prospect_id]) m[r.prospect_id] = [];
      m[r.prospect_id].push(r);
      return m;
    }, {});

    const now = Date.now();
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

    // Preload recent outreach in BULK to avoid per-prospect requests (prevents 429 rate limits)
    const outreachByProspect = {};
    if (targetProspectId) {
      const list = await base44.entities.SalesOutreach.filter({ prospect_id: targetProspectId }, '-sent_date', 200);
      outreachByProspect[targetProspectId] = list;
    } else {
      const recentOutreachAll = await base44.entities.SalesOutreach.filter({}, '-sent_date', 5000);
      const prospectIdSet = new Set(prospects.map(p => p.id));
      for (const r of recentOutreachAll) {
        if (prospectIdSet.has(r.prospect_id)) {
          if (!outreachByProspect[r.prospect_id]) outreachByProspect[r.prospect_id] = [];
          outreachByProspect[r.prospect_id].push(r);
        }
      }
    }

    const recs = [];
    for (const p of prospects) {
      const engagement = typeof p.engagement_score === 'number' ? p.engagement_score : 0;
      const fit = typeof p.fit_score === 'number' ? p.fit_score : 50;
      const hasRun = Array.isArray(runsByProspect[p.id]) && runsByProspect[p.id].length > 0;

      // Use preloaded recent outreach for this prospect
      const outreachList = outreachByProspect[p.id] || [];
      const recent = outreachList.filter(o => new Date(o.sent_date || o.created_date || 0).getTime() >= (now - twoWeeksMs));
      const recentEng = recent.reduce((acc, r) => {
        if (r.opened) acc.opens++;
        if (r.clicked) acc.clicks++;
        if (r.replied) acc.replies++;
        return acc;
      }, { opens: 0, clicks: 0, replies: 0 });

      let recommendation = null;
      if (!hasRun && fit >= 60 && engagement >= 40) {
        // High fit and decent engagement -> enroll into best sequence
        if (bestSeqId) {
          recommendation = { action: 'enroll', sequence_id: bestSeqId, reason: 'High fit and engagement; enroll to capitalize momentum.' };
        }
      } else if (hasRun && engagement < 20 && (recentEng.opens + recentEng.clicks + recentEng.replies === 0)) {
        recommendation = { action: 'pause', reason: 'Low engagement in last 14 days; pause sequence to avoid fatigue.' };
      } else if (recentEng.replies > 0) {
        recommendation = { action: 'remove', reason: 'Prospect replied; stop automation and handoff to human follow-up.' };
      }

      if (recommendation) {
        recs.push({ prospect_id: p.id, prospect_name: p.contact_name || p.company_name, recommendation });
        await base44.entities.SequenceOptimizationLog.create({
          sequence_id: recommendation.sequence_id || 'n/a',
          log_type: 'prospect_action_recommended',
          details: { prospect_id: p.id, recommendation },
          timestamp: new Date().toISOString()
        });
      }
    }

    return Response.json({ recommendations: recs });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});