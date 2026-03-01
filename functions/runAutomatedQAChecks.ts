import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Use service role for cross-entity reads
    const svc = base44.asServiceRole;

    const [projects, projectDocs, pDocsApprovals, projDocs, projDocComments, milestones, changeOrders, proposals, projectRequests] = await Promise.all([
      svc.entities.Project.list('-created_date', 1000),
      svc.entities.ProjectDocument.list('-created_date', 1000),
      svc.entities.DocumentApproval.list('-created_date', 1000),
      svc.entities.ProjectDoc.list('-created_date', 1000),
      svc.entities.DocumentComment.list('-created_date', 1000),
      svc.entities.ProjectMilestone.list('-created_date', 1000).catch(() => []),
      svc.entities.ChangeOrder.list('-created_date', 1000).catch(() => []),
      svc.entities.Proposal.list('-created_date', 1000).catch(() => []),
      svc.entities.ProjectRequest.list('-created_date', 1000).catch(() => [])
    ]);

    const report = [];

    // Check 1: ProjectDoc approvals when Under Review should have approver_email set
    const pdocsUnderReview = projDocs.filter(d => d.status === 'Under Review');
    const missingApprover = pdocsUnderReview.filter(d => !d.approver_email);
    report.push({ check: 'ProjectDoc approver on Under Review', passed: missingApprover.length === 0, details: { missingApprover: missingApprover.map(d => d.id) }});

    // Check 2: RFI answered must have fields.answer
    const rfis = projDocs.filter(d => d.doc_type === 'RFI');
    const rfisAnsweredMissing = rfis.filter(r => r.status === 'answered' && !(r.fields && r.fields.answer));
    report.push({ check: 'RFI answered has answer', passed: rfisAnsweredMissing.length === 0, details: { missing: rfisAnsweredMissing.map(r => r.id) }});

    // Check 3: Milestones Pending Approval should not have client_approval_date
    const msPending = (milestones || []).filter(m => m.status === 'Pending Client Approval');
    const msWithApprovalDate = msPending.filter(m => !!m.client_approval_date);
    report.push({ check: 'Milestones pending no approval date', passed: msWithApprovalDate.length === 0, details: { invalid: msWithApprovalDate.map(m => m.id) }});

    // Check 4: ChangeOrders Approved should not be missing client_approval_date
    const coApproved = (changeOrders || []).filter(c => c.status === 'Approved');
    const coMissingApprovalDate = coApproved.filter(c => !c.client_approval_date);
    report.push({ check: 'ChangeOrders approved have approval date', passed: coMissingApprovalDate.length === 0, details: { missing: coMissingApprovalDate.map(c => c.id) }});

    // Check 5: Proposals signed have signature_data
    const signedProposals = (proposals || []).filter(p => p.status === 'signed');
    const signedMissingSig = signedProposals.filter(p => !p.signature_data || !p.signature_data.signer_email);
    report.push({ check: 'Signed proposals have signature', passed: signedMissingSig.length === 0, details: { missing: signedMissingSig.map(p => p.id) }});

    // Check 6: All qa_seed records flagged correctly (if present)
    const qaEntities = [projects, projectDocs, projDocs, milestones || [], changeOrders || [], proposals || [], projectRequests || []];
    const unflagged = qaEntities.flat().filter((e) => e && e.qa_seed === true ? false : (e && e.description === 'QA_SEEDED')); // legacy flag
    report.push({ check: 'QA seed flag presence (lenient)', passed: true, details: { note: 'Informational', countLegacyFlagged: unflagged.length }});

    return Response.json({ status: 'success', report });
  } catch (error) {
    return Response.json({ status: 'error', error: error.message }, { status: 500 });
  }
});