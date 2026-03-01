export function getChallengerPresets() {
  // Challenger methodology-based presets: Reframe, Hidden Problem, Solution Bridge, CTA, Breakup
  const templates = [
    {
      template_name: "Challenger | 1-Reframe",
      category: "outreach",
      subject: "Idea for {{company_name}} / {{industry_insight}}",
      body_html: `
        <p>Hi {{prospect_first_name}},</p>
        <p>We're seeing {{industry_insight}} causing {{status_quo_cost}} for teams like {{company_name}} — not from obvious gaps, but from how the current process treats {{legacy_assumption}} as a given.</p>
        <p>Quick takeaway: when {{legacy_assumption}} shifts to {{new_approach}}, teams typically unlock {{delta_metric}} within a quarter.</p>
        <p>Worth a 10-min compare/contrast?</p>
        <p>– {{sender_name}}</p>
      `,
      variables: ["prospect_first_name","company_name","industry_insight","status_quo_cost","legacy_assumption","new_approach","delta_metric","sender_name"],
      notes: "Teach for differentiation; challenge legacy assumption; keep under 5 sentences"
    },
    {
      template_name: "Challenger | 2-Hidden Problem",
      category: "outreach",
      subject: "The real cost of {{problem_label}}",
      body_html: `
        <p>{{prospect_first_name}}, one hidden drag from {{problem_label}} is {{hidden_risk}} — it doesn’t show up on dashboards, but it compounds monthly.</p>
        <p>Leaders who fixed this avoided {{competitor_edge}} their peers faced and recovered {{recovered_value}} within 90 days.</p>
        <p>If helpful, I can share a 1-pager on spotting {{hidden_risk}} early.</p>
        <p>– {{sender_name}}</p>
      `,
      variables: ["prospect_first_name","problem_label","hidden_risk","competitor_edge","recovered_value","sender_name"],
      notes: "Build tension by quantifying risk and competitive exposure"
    },
    {
      template_name: "Challenger | 3-Solution Bridge",
      category: "outreach",
      subject: "A new approach to {{problem_label}}",
      body_html: `
        <p>Instead of adding more steps to {{current_process}}, teams switch to {{approach_name}} — a pattern that changes the outcome without extra headcount.</p>
        <p>In a recent case, {{peer_company}} moved from {{before_state}} to {{after_state}} and saw {{proof_point}}.</p>
        <p>I can walk you through the decision criteria we used in 10 minutes.</p>
        <p>– {{sender_name}}</p>
      `,
      variables: ["current_process","approach_name","peer_company","before_state","after_state","proof_point","sender_name"],
      notes: "Introduce point-of-view solution, not features; show evidence"
    },
    {
      template_name: "Challenger | 4-CTA (Insight Offer)",
      category: "outreach",
      subject: "Thought you'd find this interesting",
      body_html: `
        <p>I've got a brief benchmark on {{benchmark_topic}} tailored for {{prospect_team}} — no pitch, just the data and what top performers changed first.</p>
        <p>Open to 10 minutes this week so you can pressure-test if it's relevant?</p>
        <p>– {{sender_name}}</p>
      `,
      variables: ["benchmark_topic","prospect_team","sender_name"],
      notes: "Take control with a tight CTA focused on value"
    },
    {
      template_name: "Challenger | 5-Breakup",
      category: "outreach",
      subject: "Closing the loop",
      body_html: `
        <p>I'll close the loop here — sounds like {{priority_area}} isn't a focus this quarter.</p>
        <p>If that changes, happy to share the quick benchmark or decision guide.</p>
        <p>– {{sender_name}}</p>
      `,
      variables: ["priority_area","sender_name"],
      notes: "Polite opt-out to trigger responses; no guilt, no pressure"
    }
  ];

  const sequences = [
    {
      sequence_name: "Challenger - Standard (5-Step)",
      description: "Reframe → Hidden Problem → Solution Bridge → Insight CTA → Breakup (3-4 week cadence)",
      steps: [
        { step_name: "Reframe", template_ref: "Challenger | 1-Reframe", delay_days: 0 },
        { step_name: "Hidden Problem", template_ref: "Challenger | 2-Hidden Problem", delay_days: 3 },
        { step_name: "Solution Bridge", template_ref: "Challenger | 3-Solution Bridge", delay_days: 7 },
        { step_name: "CTA", template_ref: "Challenger | 4-CTA (Insight Offer)", delay_days: 14 },
        { step_name: "Breakup", template_ref: "Challenger | 5-Breakup", delay_days: 21 }
      ]
    },
    {
      sequence_name: "Challenger - Ops Efficiency (4-Step)",
      description: "Ops-focused: cost leakage + process waste reframes with decisive CTA",
      steps: [
        { step_name: "Reframe (Ops)", template_ref: "Challenger | 1-Reframe", delay_days: 0 },
        { step_name: "Hidden Cost (Ops)", template_ref: "Challenger | 2-Hidden Problem", delay_days: 4 },
        { step_name: "Solution Bridge (Ops)", template_ref: "Challenger | 3-Solution Bridge", delay_days: 9 },
        { step_name: "CTA (Ops)", template_ref: "Challenger | 4-CTA (Insight Offer)", delay_days: 16 }
      ]
    }
  ];

  return { templates, sequences };
}