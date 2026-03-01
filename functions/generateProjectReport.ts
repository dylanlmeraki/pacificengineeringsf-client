import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { schedule_id, project_ids, client_email, include_sections, custom_intro, send_email } = await req.json();

    // Gather project data
    let projects = [];
    if (project_ids && project_ids.length > 0) {
      const all = await base44.asServiceRole.entities.Project.list('-created_date', 500);
      projects = all.filter(p => project_ids.includes(p.id));
    } else if (client_email) {
      projects = await base44.asServiceRole.entities.Project.filter({ client_email }, '-created_date', 100);
    } else {
      projects = await base44.asServiceRole.entities.Project.list('-created_date', 50);
    }

    if (projects.length === 0) {
      return Response.json({ error: 'No projects found for the given scope' }, { status: 400 });
    }

    const pids = projects.map(p => p.id);
    const sections = include_sections || ['progress', 'milestones', 'budget'];

    // Fetch related data in parallel
    const [allMilestones, allCOs, allInvoices, allMessages, allDocs] = await Promise.all([
      sections.some(s => ['milestones', 'progress'].includes(s))
        ? base44.asServiceRole.entities.ProjectMilestone.list('-created_date', 500).then(ms => ms.filter(m => pids.includes(m.project_id)))
        : Promise.resolve([]),
      sections.includes('change_orders')
        ? base44.asServiceRole.entities.ChangeOrder.list('-created_date', 500).then(cs => cs.filter(c => pids.includes(c.project_id)))
        : Promise.resolve([]),
      sections.includes('invoices') || sections.includes('budget')
        ? base44.asServiceRole.entities.Invoice.list('-created_date', 500).then(inv => inv.filter(i => pids.includes(i.project_id)))
        : Promise.resolve([]),
      sections.includes('messages')
        ? base44.asServiceRole.entities.ProjectMessage.list('-created_date', 200).then(ms => ms.filter(m => pids.includes(m.project_id)))
        : Promise.resolve([]),
      sections.includes('documents')
        ? base44.asServiceRole.entities.ProjectDocument.list('-created_date', 300).then(ds => ds.filter(d => pids.includes(d.project_id)))
        : Promise.resolve([]),
    ]);

    // Build a structured summary for the LLM
    const projectSummaries = projects.map(p => {
      const ms = allMilestones.filter(m => m.project_id === p.id);
      const cos = allCOs.filter(c => c.project_id === p.id);
      const inv = allInvoices.filter(i => i.project_id === p.id);
      const msgs = allMessages.filter(m => m.project_id === p.id);
      const docs = allDocs.filter(d => d.project_id === p.id);

      return {
        name: p.project_name,
        status: p.status,
        progress: p.progress_percentage || 0,
        type: p.project_type,
        start_date: p.start_date,
        estimated_completion: p.estimated_completion,
        budget: p.budget,
        milestones_total: ms.length,
        milestones_completed: ms.filter(m => m.status === 'Completed').length,
        milestones_pending_approval: ms.filter(m => m.status === 'Pending Client Approval').length,
        change_orders_count: cos.length,
        change_orders_cost_impact: cos.reduce((s, c) => s + (c.cost_impact || 0), 0),
        invoices_total: inv.reduce((s, i) => s + (i.total_amount || 0), 0),
        invoices_paid: inv.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total_amount || 0), 0),
        invoices_outstanding: inv.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.total_amount || 0), 0),
        recent_messages: msgs.slice(0, 5).map(m => ({ from: m.sender_name, text: m.message?.substring(0, 100), date: m.created_date })),
        documents_count: docs.length,
      };
    });

    const sectionsList = sections.join(', ');
    const intro = custom_intro || '';

    const prompt = `You are a professional project report generator for a construction engineering firm called Pacific Engineering.
Generate a clean, professional HTML report covering the following sections: ${sectionsList}.

${intro ? `Custom introduction: ${intro}` : ''}

Report date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Project data:
${JSON.stringify(projectSummaries, null, 2)}

Requirements:
- Use clean HTML with inline styles (no external CSS)
- Use a professional color scheme (blues, grays)
- Include a header with "Pacific Engineering – Project Report" and date
- For each project, include only the sections requested
- For "progress": show status, percentage, timeline info
- For "milestones": list milestone counts and pending approvals
- For "budget": show budget vs invoiced vs outstanding
- For "change_orders": summarize count and cost impact
- For "documents": count of documents
- For "messages": recent communication highlights
- For "invoices": payment summary
- For "risks": identify any risks (overdue, behind schedule, etc.)
- End with a brief executive summary
- Keep it concise but informative
- Do NOT include any markdown code fences, just raw HTML`;

    const reportHtml = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

    // If schedule_id provided, update the schedule record
    if (schedule_id) {
      await base44.asServiceRole.entities.ScheduledReport.update(schedule_id, {
        last_generated_at: new Date().toISOString(),
        last_report_html: reportHtml,
        generation_count: (await base44.asServiceRole.entities.ScheduledReport.filter({ id: schedule_id }))?.[0]?.generation_count + 1 || 1
      });
    }

    // Optionally send via email
    if (send_email && send_email.length > 0) {
      for (const email of send_email) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            from_name: 'Pacific Engineering Reports',
            subject: `Project Report – ${new Date().toLocaleDateString()}`,
            body: reportHtml
          });
        } catch (e) {
          console.error(`Failed to send report to ${email}:`, e.message);
        }
      }
    }

    return Response.json({ success: true, report_html: reportHtml });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});