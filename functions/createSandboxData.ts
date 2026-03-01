import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    let body = {};
    try { body = await req.json(); } catch (_) {}
    const clientEmail = body.client_email || `qa.client.sbx+${Date.now()}@example.com`;
    const clientName = body.client_name || 'QA Client SBX';
    const adminEmail = body.admin_email || user.email;
    const sendTestEmails = !!body.send_test_emails;

    // 1) Create a comprehensive sandbox project for the client
    const project = await base44.asServiceRole.entities.Project.create({
      project_name: `SBX – ${clientName} Project`,
      project_number: `SBX-${Date.now()}`,
      client_email: clientEmail,
      client_name: clientName,
      project_type: 'Construction',
      status: 'In Progress',
      priority: 'Medium',
      start_date: new Date().toISOString().slice(0, 10),
      estimated_completion: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      location: 'San Francisco, CA',
      description: 'SANDBOX_SEEDED',
      progress_percentage: 25,
      qa_seed: true,
    });

    // 2) Milestones (pending + in progress)
    const milestones = await base44.asServiceRole.entities.ProjectMilestone.bulkCreate([
      { project_id: project.id, milestone_name: 'Kickoff', description: 'Project kickoff meeting', due_date: new Date(Date.now()+5*86400000).toISOString().slice(0,10), amount: 0, status: 'In Progress', qa_seed: true },
      { project_id: project.id, milestone_name: 'Planning Complete', description: 'Plans finalized', due_date: new Date(Date.now()+14*86400000).toISOString().slice(0,10), amount: 0, status: 'Pending Client Approval', qa_seed: true },
      { project_id: project.id, milestone_name: 'Foundation Review', description: 'Review foundation work', due_date: new Date(Date.now()+21*86400000).toISOString().slice(0,10), amount: 15000, status: 'Pending Client Approval', qa_seed: true }
    ]);

    // 3) Change Orders (one approved + one pending)
    const changeOrders = await base44.asServiceRole.entities.ChangeOrder.bulkCreate([
      { project_id: project.id, change_order_number: `CO-${Date.now()}-1`, title: 'Add shear wall', description: 'Structural revision per RFI', reason: 'RFI response', cost_impact: 4200, schedule_impact_days: 1, status: 'Approved', priority: 'High', proposed_by: adminEmail, proposed_by_name: user.full_name || 'Admin', qa_seed: true },
      { project_id: project.id, change_order_number: `CO-${Date.now()}-2`, title: 'Door hardware change', description: 'Spec update', reason: 'Owner request', cost_impact: 650, schedule_impact_days: 0, status: 'Pending Client Approval', priority: 'Medium', proposed_by: adminEmail, proposed_by_name: user.full_name || 'Admin', qa_seed: true }
    ]);

    // 4) Files (ProjectDocument) and Construction Docs (ProjectDoc)
    const files = await base44.asServiceRole.entities.ProjectDocument.bulkCreate([
      { project_id: project.id, document_name: 'Contract – Main', document_type: 'Contract', file_url: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200', file_size: 123456, uploaded_by: adminEmail, uploaded_by_name: user.full_name || 'Admin', status: 'Under Review', qa_seed: true },
      { project_id: project.id, document_name: 'Inspection Report 1', document_type: 'Inspection Report', file_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200', file_size: 123456, uploaded_by: adminEmail, uploaded_by_name: user.full_name || 'Admin', status: 'Draft', qa_seed: true }
    ]);

    const pdocs = await base44.asServiceRole.entities.ProjectDoc.bulkCreate([
      { project_id: project.id, project_name: project.project_name, client_email: clientEmail, doc_type: 'RFI', doc_number: `RFI-1`, title: 'Anchor detail question', status: 'pending_approval', approver_email: adminEmail, requested_at: new Date().toISOString(), qa_seed: true, fields: { question: 'Clarify anchor size at grid B-3' } },
      { project_id: project.id, project_name: project.project_name, client_email: clientEmail, doc_type: 'Submittal', doc_number: `SUB-1`, title: 'Concrete mix 033000', status: 'shared_with_client', approver_email: adminEmail, requested_at: new Date().toISOString(), qa_seed: true, fields: { spec_section: '033000', item: 'Concrete mix', sub_status: 'Submitted' } }
    ]);

    // 5) Approvals & comments
    await base44.asServiceRole.entities.DocumentApproval.bulkCreate([
      { document_id: files[0].id, project_id: project.id, requested_by: adminEmail, requested_from: adminEmail, approval_type: 'document_review', status: 'pending', due_date: new Date(Date.now()+3*86400000).toISOString(), qa_seed: true }
    ]);
    await base44.asServiceRole.entities.DocumentComment.bulkCreate([
      { document_id: files[0].id, project_id: project.id, comment: 'Please review and sign', author_email: adminEmail, author_name: user.full_name || 'Admin', is_internal: false, qa_seed: true }
    ]);

    // 6) Messages
    await base44.asServiceRole.entities.ProjectMessage.bulkCreate([
      { project_id: project.id, message: 'Welcome to your project thread!', sender_email: clientEmail, sender_name: clientName, is_internal: false, qa_seed: true },
      { project_id: project.id, message: 'Attached Contract – please review', sender_email: adminEmail, sender_name: user.full_name || 'Admin', is_internal: true, qa_seed: true }
    ]);

    // 7) Proposal & invoice
    const proposal = await base44.asServiceRole.entities.Proposal.create({
      project_id: project.id,
      proposal_number: `PROP-${Date.now()}`,
      title: 'Sandbox Proposal',
      content_html: '<h1>Sandbox Proposal</h1><p>Scope of work...</p>',
      amount: 12500,
      status: 'sent',
      sent_date: new Date().toISOString(),
      recipient_emails: [clientEmail],
      qa_seed: true
    });

    await base44.asServiceRole.entities.Invoice.create({
      invoice_number: `INV-SBX-${Date.now()}`,
      project_id: project.id,
      project_name: project.project_name,
      client_email: clientEmail,
      client_name: clientName,
      issue_date: new Date().toISOString().slice(0,10),
      due_date: new Date(Date.now()+14*86400000).toISOString().slice(0,10),
      line_items: [ { description: 'Mobilization', quantity: 1, unit_price: 2500, amount: 2500 } ],
      tax_rate: 0,
      subtotal: 2500,
      tax_amount: 0,
      total_amount: 2500,
      status: 'sent',
      terms: 'Net 14',
      qa_seed: true
    });

    // 8) Optional sandbox emails (best-effort)
    if (sendTestEmails) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: clientEmail,
          from_name: 'Pacific Engineering Sandbox',
          subject: `Sandbox Project Ready: ${project.project_name}`,
          body: `This is a sandbox notification for QA. Project: ${project.project_name}`
        });
      } catch (e) {
        // Log but do not fail the run
        await base44.asServiceRole.entities.AuditLog.create({
          actor_email: user.email,
          actor_name: user.full_name,
          action: 'integration_triggered',
          resource_type: 'Email',
          resource_name: 'SendEmail Sandbox',
          details: `Sandbox email failed: ${e?.message || e}`
        });
      }
    }

    // 9) Activity log
    await base44.asServiceRole.entities.AuditLog.create({
      actor_email: user.email,
      actor_name: user.full_name,
      action: 'project_created',
      resource_type: 'Project',
      resource_id: project.id,
      resource_name: project.project_name,
      details: `Sandbox project seeded for ${clientEmail}`
    });

    return Response.json({
      success: true,
      project,
      client_email: clientEmail,
      client_name: clientName,
      change_orders: changeOrders.map(c => c.id),
      milestones: milestones.map(m => m.id),
      files: files.map(f => f.id),
      pdocs: pdocs.map(d => d.id),
      proposal_id: proposal.id
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to create sandbox data' }, { status: 500 });
  }
});