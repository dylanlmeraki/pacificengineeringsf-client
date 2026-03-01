import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, RefreshCw, CheckCircle2, AlertTriangle, Plus } from "lucide-react";

export default function SeedPanel() {
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [qaReport, setQaReport] = useState(null);
  const [runningQA, setRunningQA] = useState(false);
  const [pairing, setPairing] = useState(false);

  const runSeed = async () => {
    setSeeding(true);
    setSummary(null);
    try {
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

      // 1) Projects
      const clients = [
        { email: "alice@acme.com", name: "Acme Builders" },
        { email: "bob@summit.co", name: "Summit Dev Co" },
        { email: "cecilia@bayview.io", name: "Bayview Construction" },
        { email: "dave@cobalt.dev", name: "Cobalt Partners" },
        { email: "eve@northstar.ai", name: "Northstar Ventures" }
      ];

      const projectTypes = ["SWPPP", "Construction", "Inspections", "Engineering", "Special Inspections", "Multiple Services"];
      const statuses = ["Planning", "In Progress", "Under Review", "Completed", "On Hold"];
      const priorities = ["Low", "Medium", "High", "Urgent"];

      const projectsPayload = Array.from({ length: 8 }).map((_, i) => {
        const c = clients[i % clients.length];
        return {
          project_name: `${c.name} Project ${i + 1}`,
          project_number: `QA-${Date.now()}-${i + 1}`,
          client_email: c.email,
          client_name: c.name,
          project_type: pick(projectTypes),
          status: pick(statuses),
          priority: pick(priorities),
          start_date: new Date().toISOString().slice(0, 10),
          location: "San Francisco, CA",
          description: "QA_SEEDED",
          qa_seed: true
        };
      });

      const createdProjects = await base44.entities.Project.bulkCreate(projectsPayload);

      // 2) Approval Docs (ProjectDoc) - richer set with fields and statuses
      const docTypes = ["RFI","RFQ","RFP","Submittal","ASI","CCD","RFC","FieldReport"];
      const projDocsPayload = [];
      createdProjects.slice(0, 6).forEach((p, i) => {
        docTypes.forEach((t, j) => {
          const idSuffix = `${i + 1}-${j + 1}`;
          const base = {
            project_id: p.id,
            project_name: p.project_name,
            client_email: p.client_email,
            doc_type: t,
            doc_number: `${t}-${idSuffix}`,
            title: `QA ${t} ${idSuffix}`,
            status: j % 3 === 0 ? "Under Review" : j % 3 === 1 ? "pending_approval" : "shared_with_client",
            approver_email: "approver@example.com",
            due_date: new Date(Date.now() + (j + 3) * 86400000).toISOString(),
            requested_at: new Date().toISOString(),
            qa_seed: true
          };
          // minimal realistic fields per type
          const fields = {
            RFI: { question: `What is spec ${idSuffix}?`, answer: j % 3 === 2 ? "See sheet A2" : "", priority: "Normal" },
            RFQ: { scope: "Pricing request", due: base.due_date },
            RFP: { package: "Structural", bidder_list: ["ACME", "Summit"] },
            Submittal: { spec_section: "033000", item: "Concrete mix", sub_status: "Submitted" },
            ASI: { instruction: "Revise door swing", sheet: "A1.1" },
            CCD: { reason: "Unforeseen condition", cost_impact: 2500 },
            RFC: { clarification: "Detail 5/A2 unclear" },
            FieldReport: { inspector: "QA Seeder", notes: "Clean site" }
          }[t] || {};
          projDocsPayload.push({ ...base, fields });
        });
      });
      const createdProjDocs = projDocsPayload.length ? await base44.entities.ProjectDoc.bulkCreate(projDocsPayload) : [];

      // 2) Project Documents
      const fileTypes = [
        "SWPPP Plan", "Inspection Report", "Test Results", "Engineering Drawing", "Photo", "Contract", "Invoice", "Permit"
      ];
      const docsPayload = [];
      createdProjects.slice(0, 6).forEach((p, idx) => {
        for (let j = 0; j < 3; j++) {
          const t = pick(fileTypes);
          docsPayload.push({
            project_id: p.id,
            document_name: `${t} ${idx + 1}-${j + 1}`,
            document_type: t,
            description: "QA_SEEDED",
            version: "1.0",
            file_url: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200",
            file_size: 123456,
            uploaded_by: "qa@internal",
            uploaded_by_name: "QA Seeder",
            status: "Draft",
            qa_seed: true
          });
        }
      });
      const createdDocs = docsPayload.length ? await base44.entities.ProjectDocument.bulkCreate(docsPayload) : [];

      // 2b) Comments & Approvals on ProjectDoc
      const pdocComments = createdProjDocs.slice(0, 10).map((d, i) => ({
        document_id: d.id,
        project_id: d.project_id,
        comment: `QA pdoc note ${i + 1}`,
        author_email: "qa@internal",
        author_name: "QA Seeder",
        is_internal: true,
        qa_seed: true
      }));
      if (pdocComments.length) await base44.entities.DocumentComment.bulkCreate(pdocComments);
      const pdocApprovals = createdProjDocs.slice(0, 8).map((d) => ({
        document_id: d.id,
        project_id: d.project_id,
        requested_by: "qa@internal",
        requested_from: "admin@internal",
        approval_type: "document_review",
        status: "pending",
        due_date: new Date(Date.now() + 4 * 86400000).toISOString(),
        qa_seed: true
      }));
      if (pdocApprovals.length) await base44.entities.DocumentApproval.bulkCreate(pdocApprovals);

      // 3) Messages per project
      const msgsPayload = createdProjects.slice(0, 6).map((p, i) => ({
        project_id: p.id,
        message: `QA seeded message ${i + 1} for ${p.project_name}`,
        sender_email: p.client_email,
        sender_name: p.client_name,
        is_internal: false,
        qa_seed: true
      }));
      if (msgsPayload.length) await base44.entities.ProjectMessage.bulkCreate(msgsPayload);

      // 4) Invoices
      const invoicesPayload = createdProjects.slice(0, 6).map((p, i) => ({
        invoice_number: `INV-QA-${Date.now()}-${i + 1}`,
        project_id: p.id,
        project_name: p.project_name,
        client_email: p.client_email,
        client_name: p.client_name,
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + (i + 10) * 86400000).toISOString().slice(0, 10),
        line_items: [
          { description: "Service A", quantity: 2, unit_price: 500, amount: 1000 },
          { description: "Service B", quantity: 1, unit_price: 750, amount: 750 }
        ],
        tax_rate: 8.5,
        subtotal: 1750,
        tax_amount: 148.75,
        total_amount: 1898.75,
        status: pick(["draft", "sent", "paid", "overdue"]),
        terms: "Net 30",
        qa_seed: true
      }));
      if (invoicesPayload.length) await base44.entities.Invoice.bulkCreate(invoicesPayload);

      // 5) Milestones & Change Orders
      const msPayload = createdProjects.slice(0, 6).flatMap((p, i) => ([
        { project_id: p.id, milestone_name: `Foundation ${i+1}`, description: "Footings complete", due_date: new Date(Date.now()+ (5+i)*86400000).toISOString().slice(0,10), amount: 5000, status: i%2?"In Progress":"Pending Client Approval", qa_seed: true },
        { project_id: p.id, milestone_name: `Framing ${i+1}`, description: "Walls framed", due_date: new Date(Date.now()+ (12+i)*86400000).toISOString().slice(0,10), amount: 12000, status: "Pending Client Approval", qa_seed: true }
      ]));
      if (msPayload.length) await base44.entities.ProjectMilestone.bulkCreate(msPayload);

      const coPayload = createdProjects.slice(0, 6).map((p, i) => ({
        project_id: p.id,
        change_order_number: `CO-${Date.now()}-${i+1}`,
        title: `Add beam ${i+1}`,
        description: "Structural revision",
        reason: "RFI response",
        cost_impact: 3500 + i*250,
        schedule_impact_days: i,
        status: i%2?"Pending Client Approval":"Approved",
        priority: i%3?"Medium":"High",
        proposed_by: "qa@internal",
        proposed_by_name: "QA Seeder",
        qa_seed: true
      }));
      if (coPayload.length) await base44.entities.ChangeOrder.bulkCreate(coPayload);

      // 6) Proposals in all lifecycle stages
      const propStatuses = ["draft","sent","viewed","awaiting_signature","signed","declined","expired"];
      const proposalPayload = createdProjects.slice(0, 6).map((p, i) => ({
        project_id: p.id,
        proposal_number: `PROP-${Date.now()}-${i+1}`,
        title: `QA Proposal ${i+1}`,
        content_html: `<h1>Proposal ${i+1}</h1><p>Scope of work</p>`,
        amount: 10000 + i*2000,
        status: propStatuses[i % propStatuses.length],
        sent_date: new Date().toISOString(),
        viewed_date: new Date().toISOString(),
        signed_date: (i%6===4)? new Date().toISOString(): undefined,
        declined_date: (i%6===5)? new Date().toISOString(): undefined,
        declined_reason: (i%6===5)? "Budget constraints": undefined,
        expiration_date: new Date(Date.now() + (20-i)*86400000).toISOString(),
        recipient_emails: [p.client_email],
        signature_data: (i%6===4)? { signer_name: p.client_name, signer_email: p.client_email, signed_at: new Date().toISOString() }: undefined,
        qa_seed: true
      }));
      if (proposalPayload.length) await base44.entities.Proposal.bulkCreate(proposalPayload);

      // 7) Project Requests
      const preqPayload = createdProjects.slice(0, 4).map((p, i) => ({
        request_title: `QA Request ${i+1}`,
        project_type: p.project_type,
        description: "Client requested additional scope",
        location: p.location,
        client_email: p.client_email,
        client_name: p.client_name,
        status: i%2?"Pending Review":"In Discussion",
        qa_seed: true
      }));
      if (preqPayload.length) await base44.entities.ProjectRequest.bulkCreate(preqPayload);

      // 8) Annotations & Approvals on first few docs
      const annPayload = createdDocs.slice(0, 6).map((d, i) => ({
        document_id: d.id,
        project_id: d.project_id,
        comment: `QA note ${i + 1}`,
        author_email: "qa@internal",
        author_name: "QA Seeder",
        is_internal: false,
        qa_seed: true
      }));
      if (annPayload.length) await base44.entities.DocumentComment.bulkCreate(annPayload);

      const apprPayload = createdDocs.slice(0, 4).map((d) => ({
        document_id: d.id,
        project_id: d.project_id,
        requested_by: "qa@internal",
        requested_from: "admin@internal",
        approval_type: "document_review",
        status: "pending",
        due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
        qa_seed: true
      }));
      if (apprPayload.length) await base44.entities.DocumentApproval.bulkCreate(apprPayload);

      setSummary({ 
        projects: createdProjects.length, 
        files: createdDocs.length,
        construction_docs: createdProjDocs.length,
        milestones: msPayload.length,
        change_orders: coPayload.length,
        proposals: proposalPayload.length,
        project_requests: preqPayload.length,
        comments: pdocComments.length + annPayload.length,
        approvals: pdocApprovals.length + apprPayload.length
      });
    } finally {
      setSeeding(false);
    }
  };

  const runReset = async () => {
    setResetting(true);
    setSummary(null);
    try {
      const cleanup = async (entityName) => {
        try {
          const items = await base44.entities[entityName].filter({ qa_seed: true }, '-created_date', 1000);
          for (const item of items) {
            await base44.entities[entityName].delete(item.id);
          }
        } catch (_) { /* ignore */ }
      };

      await cleanup('DocumentApproval');
      await cleanup('DocumentComment');
      await cleanup('Invoice');
      await cleanup('ProjectMessage');
      await cleanup('ProjectDocument');
      await cleanup('ProjectDoc');
      await cleanup('ProjectMilestone');
      await cleanup('ChangeOrder');
      await cleanup('Proposal');
      await cleanup('ProjectRequest');

      await cleanup('Project');
    } finally {
      setResetting(false);
    }
  };

  const runQA = async () => {
    setRunningQA(true);
    try {
      const { data } = await base44.functions.invoke('runAutomatedQAChecks', {});
      setQaReport(data);
    } finally {
      setRunningQA(false);
    }
  };

  const createTestPairAndSeed = async () => {
    setPairing(true);
    try {
      const ts = Date.now();
      const adminEmail = `qa.admin.sbx+${ts}@example.com`;
      const clientEmail = `qa.client.sbx+${ts}@example.com`;

      // Invite sandbox users
      await base44.users.inviteUser(adminEmail, 'admin');
      await base44.users.inviteUser(clientEmail, 'user');

      // Seed sandbox data for that client (no real emails sent)
      const { data } = await base44.functions.invoke('createSandboxData', {
        client_email: clientEmail,
        client_name: 'QA Client SBX',
        admin_email: adminEmail,
        send_test_emails: false
      });

      setSummary(prev => ({ ...(prev || {}), sandbox_project: data?.project?.id, client_email: clientEmail }));
      base44.analytics.track({ eventName: 'qa_seed_sandbox_created', properties: { success: true } });
    } catch (e) {
      base44.analytics.track({ eventName: 'qa_seed_sandbox_created', properties: { success: false } });
    } finally {
      setPairing(false);
    }
  };

   return (
    <Card className="p-6 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-gray-900 flex items-center gap-2"><Database className="w-5 h-5" /> Test Data</div>
        {summary && (
          <Badge className="bg-green-100 text-green-700">Seeded: {summary.projects} proj, {summary.files} files, {summary.construction_docs} c-docs</Badge>
        )}
      </div>
      <div className="flex gap-3 flex-wrap">
        <Button onClick={createTestPairAndSeed} disabled={pairing} className="bg-indigo-600 hover:bg-indigo-700">
          {pairing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create QA Test Pair + Full Seed
        </Button>
        <Button onClick={runSeed} disabled={seeding} className="bg-blue-600 hover:bg-blue-700">
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Seed Test Data
        </Button>
        <Button onClick={runReset} disabled={resetting} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
          {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Reset Test Data
        </Button>
        <Button onClick={runQA} disabled={runningQA} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
          {runningQA ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Run Automated QA
        </Button>
        <Badge variant="outline" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Admin-only</Badge>
      </div>

      {summary && (
        <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
          {Object.entries(summary).map(([k,v]) => (
            <div key={k} className="p-2 bg-gray-50 rounded border text-gray-700 flex justify-between"><span className="font-semibold">{k.replaceAll('_',' ')}</span><span>{v}</span></div>
          ))}
        </div>
      )}

      {qaReport && (
        <div className="mt-6">
          <div className="text-sm font-semibold text-gray-900 mb-2">Automated QA Report</div>
          {qaReport.status === 'success' ? (
            <div className="space-y-2">
              {qaReport.report.map((r, idx) => (
                <div key={idx} className={`p-3 rounded border ${r.passed ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  <div className="font-medium">{r.check}</div>
                  <div className="text-xs text-gray-700">{r.passed ? 'PASSED' : 'FAILED'}</div>
                  {r.details && <pre className="text-xs mt-1 overflow-auto max-h-40">{JSON.stringify(r.details, null, 2)}</pre>}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded border border-red-300 bg-red-50 text-sm text-red-800">{qaReport.error || 'QA run failed'}</div>
          )}
        </div>
      )}
    </Card>
  );
}