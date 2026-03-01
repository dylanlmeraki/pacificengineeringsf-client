import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function rate(n, d) {
  return d > 0 ? n / d : 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch sequences and recent outreach data
    const sequences = await base44.entities.EmailSequence.list();

    // Compute global averages from recent outreach (limit reasonable to keep runtime bounded)
    const recentOutreach = await base44.entities.SalesOutreach.filter({}, '-sent_date', 5000);
    const global = recentOutreach.reduce((acc, r) => {
      acc.sent += 1;
      if (r.opened) acc.opens += 1;
      if (r.clicked) acc.clicks += 1;
      if (r.replied) acc.replies += 1;
      return acc;
    }, { sent: 0, opens: 0, clicks: 0, replies: 0 });
    const globalRates = {
      openRate: rate(global.opens, global.sent),
      clickRate: rate(global.clicks, global.sent),
      replyRate: rate(global.replies, global.sent),
    };

    const results = [];

    for (const seq of sequences) {
      const seqOutreach = await base44.entities.SalesOutreach.filter({ sequence_id: seq.id }, '-sent_date', 5000);

      // Aggregate per sequence
      const agg = seqOutreach.reduce((acc, r) => {
        acc.sent += 1;
        if (r.opened) acc.opens += 1;
        if (r.clicked) acc.clicks += 1;
        if (r.replied) acc.replies += 1;
        return acc;
      }, { sent: 0, opens: 0, clicks: 0, replies: 0 });

      // Aggregate per step and variant
      const stepAgg = {};
      for (const r of seqOutreach) {
        const key = `${r.step_index ?? 'NA'}|${r.ab_variant ?? 'NA'}`;
        if (!stepAgg[key]) stepAgg[key] = { sent: 0, opens: 0, clicks: 0, replies: 0, step_index: r.step_index ?? null, ab_variant: r.ab_variant ?? null };
        const a = stepAgg[key];
        a.sent += 1;
        if (r.opened) a.opens += 1;
        if (r.clicked) a.clicks += 1;
        if (r.replied) a.replies += 1;
      }

      const stepSummaries = Object.values(stepAgg).map(a => ({
        step_index: a.step_index,
        ab_variant: a.ab_variant,
        sent: a.sent,
        openRate: rate(a.opens, a.sent),
        clickRate: rate(a.clicks, a.sent),
        replyRate: rate(a.replies, a.sent),
      }));

      // Identify underperforming steps (below thresholds or below global averages by 30%)
      const underperforming = stepSummaries.filter(s => (
        (s.openRate < 0.20) || (s.replyRate < 0.02) ||
        (globalRates.openRate && s.openRate < globalRates.openRate * 0.7) ||
        (globalRates.replyRate && s.replyRate < globalRates.replyRate * 0.7)
      ));

      const suggestions = [];

      // For each underperforming step, ask LLM for improvements with template context if available
      for (const s of underperforming) {
        let template = null;
        try {
          const stepConfig = Array.isArray(seq.steps) && typeof s.step_index === 'number' ? seq.steps[s.step_index] : null;
          if (stepConfig?.template_id) {
            const t = await base44.entities.EmailTemplate.filter({ id: stepConfig.template_id }, undefined, 1);
            template = t?.[0] || null;
          }
        } catch (_) { /* non-fatal */ }

        const prompt = `You are an email outreach expert. Analyze the following step performance and suggest actionable improvements.\n\nSequence: ${seq.sequence_name || seq.id}\nStep Index: ${s.step_index}\nVariant: ${s.ab_variant || 'N/A'}\nSent: ${s.sent}\nOpen Rate: ${(s.openRate*100).toFixed(1)}%\nClick Rate: ${(s.clickRate*100).toFixed(1)}%\nReply Rate: ${(s.replyRate*100).toFixed(1)}%\nGlobal Open Rate: ${(globalRates.openRate*100).toFixed(1)}%\nGlobal Reply Rate: ${(globalRates.replyRate*100).toFixed(1)}%\n\nTemplate Context (if any):\nSubject: ${template?.subject || 'Unknown'}\nBody (HTML allowed): ${template?.body_html ? template.body_html.slice(0, 2000) : 'Unknown'}\n\nProvide:\n- 3 improved subject lines\n- 1 improved email body (HTML allowed)\n- Recommended delay adjustments (days/hours)\n- A/B recommendation (keep A, keep B, or propose new split)\n- 1-2 branching rule ideas based on engagement events.`;

        const llm = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: false,
          response_json_schema: {
            type: 'object',
            properties: {
              subject_suggestions: { type: 'array', items: { type: 'string' } },
              body_suggestion: { type: 'string' },
              delay_recommendation: { type: 'object', additionalProperties: true },
              ab_recommendation: { type: 'object', additionalProperties: true },
              branching_rules: { type: 'array', items: { type: 'object', additionalProperties: true } }
            },
            required: ['subject_suggestions', 'body_suggestion']
          }
        });

        suggestions.push({ step_index: s.step_index, ab_variant: s.ab_variant, llm });

        await base44.entities.SequenceOptimizationLog.create({
          sequence_id: seq.id,
          log_type: 'suggestion_generated',
          details: {
            step_index: s.step_index,
            ab_variant: s.ab_variant,
            metrics: s,
            suggestions: llm
          },
          timestamp: new Date().toISOString()
        });
      }

      const summary = {
        sequence_id: seq.id,
        sequence_name: seq.sequence_name || null,
        totals: {
          sent: agg.sent,
          openRate: rate(agg.opens, agg.sent),
          clickRate: rate(agg.clicks, agg.sent),
          replyRate: rate(agg.replies, agg.sent)
        },
        stepSummaries,
        underperforming: underperforming.map(u => ({ step_index: u.step_index, ab_variant: u.ab_variant }))
      };

      results.push(summary);

      await base44.entities.SequenceOptimizationLog.create({
        sequence_id: seq.id,
        log_type: 'performance_analysis',
        details: summary,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({ globalRates, results });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});