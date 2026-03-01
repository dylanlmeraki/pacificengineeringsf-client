import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminRoute from "../components/internal/AdminRoute";
import { base44 } from "@/api/base44Client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, Building2, Mail, FileText, MessageSquare, FileSignature, Sparkles, 
  UploadCloud, Filter, Loader2, Plus, AlertTriangle, CheckCircle2, Activity as ActivityIcon
} from "lucide-react";

// Reused portal/internal components
import DocumentUploader from "@/components/portal/DocumentUploader";
import DocumentAnnotator from "@/components/portal/DocumentAnnotator";
import DocumentApprovalFlow from "@/components/portal/DocumentApprovalFlow";
import DocumentSigner from "@/components/portal/DocumentSigner";
import MessageThread from "@/components/portal/MessageThread";
import ConstructionDocumentViewer from "@/components/projectDocs/ConstructionDocumentViewer";
import ClientInvoices from "@/components/portal/ClientInvoices";
import InvoiceManager from "@/components/invoices/InvoiceManager";
import ClientDashboard from "@/components/portal/ClientDashboard";
import ProjectRequestForm from "@/components/portal/ProjectRequestForm";
import ClientAnalytics from "@/components/portal/ClientAnalytics";
import ProjectProgressTracker from "@/components/portal/ProjectProgressTracker";
import ProposalsList from "@/components/portal/ProposalsList";
import ClientProposalView from "@/components/portal/ClientProposalView";
import ContractsApprovals from "@/components/portal/ContractsApprovals";
import ClientProfileSettings from "@/components/portal/ClientProfileSettings";

import NotificationBell from "@/components/notifications/NotificationBell";
import ReportScheduler from "@/components/communications/ReportScheduler";
import MessageTemplatePicker from "@/components/communications/MessageTemplatePicker";

export default function ClientCommunications() {
  const qc = useQueryClient();
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [viewingProposal, setViewingProposal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedDocKind, setSelectedDocKind] = useState('file');
  const [showDevTools, setShowDevTools] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  // Projects (used to derive clients list too)
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['cc-projects'],
    queryFn: async () => await base44.entities.Project.list('-created_date', 500),
    initialData: []
  });

  // Derive clients (email -> name)
  const clients = useMemo(() => {
    const map = new Map();
    projects.forEach(p => {
      if (p.client_email) {
        if (!map.has(p.client_email)) map.set(p.client_email, p.client_name || p.client_email);
      }
    });
    return Array.from(map.entries()).map(([email, name]) => ({ email, name }));
  }, [projects]);

  const clientProjects = useMemo(() => {
    if (!selectedClient) return [];
    return projects.filter(p => p.client_email === selectedClient);
  }, [projects, selectedClient]);

  // Documents for selected scope
  const { data: docs = [], isLoading: loadingDocs, refetch: refetchDocs } = useQuery({
    queryKey: ['cc-docs', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      return await base44.entities.ProjectDocument.filter({ project_id: selectedProject }, '-created_date', 300);
    },
    enabled: !!selectedProject,
    initialData: []
  });

  const { data: projDocs = [], isLoading: loadingProjDocs, refetch: refetchProjDocs } = useQuery({
    queryKey: ['cc-projdocs', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      return await base44.entities.ProjectDoc.filter({ project_id: selectedProject }, '-created_date', 300);
    },
    enabled: !!selectedProject,
    initialData: []
  });

  // Activity logs (project-scoped)
  const { data: activity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ['cc-activity', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      try {
        return await base44.entities.Activity.filter({ project_id: selectedProject }, '-created_date', 200);
      } catch {
        return [];
      }
    },
    enabled: !!selectedProject,
    initialData: []
  });

  const selectedDoc = useMemo(() => docs.find(d => d.id === selectedDocId) || null, [docs, selectedDocId]);
  const selectedProjectDoc = useMemo(() => projDocs.find(d => d.id === selectedDocId) || null, [projDocs, selectedDocId]);

  // Project Requests & Proposals
  const { data: projectRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['cc-requests', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      try { return await base44.entities.ProjectRequest.filter({ client_email: selectedClient }, '-created_date', 200); } catch { return []; }
    },
    enabled: !!selectedClient,
    initialData: []
  });

  const { data: proposals = [], refetch: refetchProposals } = useQuery({
    queryKey: ['cc-proposals', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      try { return await base44.entities.Proposal.filter({ project_id: selectedProject }, '-created_date', 200); } catch { return []; }
    },
    enabled: !!selectedProject,
    initialData: []
  });

  async function convertRequestToProject(req) {
    const proj = await base44.entities.Project.create({
      project_name: req.request_title,
      project_number: `PRJ-${Date.now()}`,
      client_email: req.client_email,
      client_name: req.client_name,
      project_type: req.project_type || 'Construction',
      status: 'Planning',
      priority: 'Medium',
      start_date: new Date().toISOString().slice(0,10),
      location: req.location || 'TBD',
      description: req.description || 'Converted from Project Request'
    });
    // Create milestones
    await base44.entities.ProjectMilestone.bulkCreate([
      { project_id: proj.id, milestone_name: 'Kickoff', description: 'Project kickoff meeting', due_date: new Date(Date.now()+7*86400000).toISOString().slice(0,10), amount: 0, status: 'In Progress' },
      { project_id: proj.id, milestone_name: 'Planning Complete', description: 'Finalize plans', due_date: new Date(Date.now()+21*86400000).toISOString().slice(0,10), amount: 0, status: 'Pending Client Approval' }
    ]);
    // Create initial tasks
    await base44.entities.Task.bulkCreate([
      { prospect_id: '', prospect_name: '', company_name: req.client_name, task_type: 'Schedule Meeting', title: 'Kickoff meeting', description: 'Schedule internal + client kickoff', priority: 'High', status: 'Pending', due_date: new Date(Date.now()+5*86400000).toISOString(), assigned_to: currentUser?.email || '' },
      { prospect_id: '', prospect_name: '', company_name: req.client_name, task_type: 'Research', title: 'Collect requirements', description: 'Gather requirements and docs', priority: 'Medium', status: 'Pending', due_date: new Date(Date.now()+10*86400000).toISOString(), assigned_to: currentUser?.email || '' }
    ]);
    await base44.entities.ProjectRequest.update(req.id, { status: 'Converted to Project' });
    setSelectedProject(proj.id);
    refetchRequests();
    qc.invalidateQueries({ queryKey: ['cc-projects'] });
  }

  async function acceptProposalLinkToProject(p) {
    let projectId = selectedProject;
    if (!projectId) {
      const proj = await base44.entities.Project.create({
        project_name: p.title || 'New Project',
        project_number: `PRJ-${Date.now()}`,
        client_email: clients[0]?.email || '',
        client_name: clients[0]?.name || '',
        project_type: 'Construction',
        status: 'In Progress',
        priority: 'Medium',
        start_date: new Date().toISOString().slice(0,10)
      });
      projectId = proj.id;
      setSelectedProject(projectId);
    }
    await base44.entities.Proposal.update(p.id, { status: 'signed', project_id: projectId, signed_date: new Date().toISOString() });
    refetchProposals();
  }

  async function createContractFromProposal(p) {
    if (!selectedProject) return;
    await base44.entities.ProjectDocument.create({
      project_id: selectedProject,
      document_name: `Contract - ${p.title}`,
      document_type: 'Contract',
      file_url: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200',
      status: 'Under Review',
      uploaded_by: currentUser?.email || 'system',
      uploaded_by_name: currentUser?.full_name || 'System'
    });
    qc.invalidateQueries({ queryKey: ['cc-docs', selectedProject] });
  }

  async function createInvoiceFromProposal(p) {
    if (!selectedProject) return;
    await base44.entities.Invoice.create({
      invoice_number: `INV-${Date.now()}`,
      project_id: selectedProject,
      project_name: clientProjects.find(x=>x.id===selectedProject)?.project_name || 'Project',
      client_email: clients.find(c=>c.email===selectedClient)?.email || '',
      client_name: clients.find(c=>c.email===selectedClient)?.name || '',
      issue_date: new Date().toISOString().slice(0,10),
      due_date: new Date(Date.now()+14*86400000).toISOString().slice(0,10),
      line_items: [{ description: p.title, quantity: 1, unit_price: p.amount || 0, amount: p.amount || 0 }],
      tax_rate: 0,
      subtotal: p.amount || 0,
      tax_amount: 0,
      total_amount: p.amount || 0,
      status: 'sent',
      terms: 'Net 14'
    });
    qc.invalidateQueries({ queryKey: ['invoices'] });
  }

  // Seed and reset test data (admin-only panel)
  const seedMutation = useMutation({
    mutationFn: async () => {
      const fnRand = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const names = ["Acme Builders", "Summit Dev Co", "Bayview Construction", "Cobalt Partners", "Northstar Ventures"];
      const contacts = ["alice@acme.com", "bob@summit.co", "cecilia@bayview.io", "dave@cobalt.dev", "eve@northstar.ai"];

      // Create projects
      const newProjects = [];
      for (let i = 0; i < 5; i++) {
        const email = contacts[i];
        const name = names[i];
        const count = 2 + (i % 3);
        for (let j = 0; j < count; j++) {
          newProjects.push({
            project_name: `${name} Project ${j + 1}`,
            project_number: `PRJ-${i + 1}${j + 1}${Date.now().toString().slice(-4)}`,
            client_email: email,
            client_name: name,
            project_type: fnRand(["SWPPP", "Construction", "Inspections", "Engineering"]),
            status: fnRand(["Planning", "In Progress", "Under Review", "Completed"]),
            priority: fnRand(["Low", "Medium", "High"]),
            start_date: new Date().toISOString().split('T')[0],
            location: "San Francisco, CA",
            description: "Seeded project"
          });
        }
      }
      const createdProjects = await base44.entities.Project.bulkCreate(newProjects);

      // Documents
      const newDocs = [];
      createdProjects.slice(0, 10).forEach((p, idx) => {
        const type = fnRand(["SWPPP Plan", "Inspection Report", "Contract", "Photo"]);
        newDocs.push({
          project_id: p.id,
          document_name: `${type} ${idx + 1}`,
          document_type: type,
          description: "Auto-seeded document",
          version: "1.0",
          file_url: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200",
          file_size: 123456,
          uploaded_by: "seed@internal",
          uploaded_by_name: "Seeder",
          status: fnRand(["Draft", "Under Review", "Approved", "Archived"]) 
        });
      });
      const createdDocs = await base44.entities.ProjectDocument.bulkCreate(newDocs);

      // Messages
      const newMsgs = createdProjects.slice(0, 10).map((p, i) => ({
        project_id: p.id,
        message: `Seed message ${i + 1} for ${p.project_name}`,
        sender_email: p.client_email,
        sender_name: p.client_name,
        is_internal: false
      }));
      await base44.entities.ProjectMessage.bulkCreate(newMsgs);

      // Invoices
      const newInvoices = createdProjects.slice(0, 8).map((p, i) => ({
        invoice_number: `INV-SEED-${Date.now()}-${i + 1}`,
        project_id: p.id,
        project_name: p.project_name,
        client_email: p.client_email,
        client_name: p.client_name,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + (i + 7) * 86400000).toISOString().split('T')[0],
        line_items: [
          { description: "Service A", quantity: 2, unit_price: 500, amount: 1000 },
          { description: "Service B", quantity: 1, unit_price: 750, amount: 750 }
        ],
        tax_rate: 8.5,
        subtotal: 1750,
        tax_amount: 148.75,
        total_amount: 1898.75,
        status: fnRand(["draft", "sent", "paid", "overdue"]),
        terms: "Net 30"
      }));
      await base44.entities.Invoice.bulkCreate(newInvoices);

      // Comments & approvals
      const newAnnotations = createdDocs.slice(0, 6).map((d, i) => ({
        document_id: d.id,
        project_id: d.project_id,
        comment: `Seed note ${i + 1}`,
        author_email: "qa@internal",
        author_name: "QA User",
        is_internal: false
      }));
      await base44.entities.DocumentComment.bulkCreate(newAnnotations);

      const newApprovals = createdDocs.slice(0, 4).map((d) => ({
        document_id: d.id,
        project_id: d.project_id,
        requested_by: "qa@internal",
        requested_from: "admin@internal",
        approval_type: "document_review",
        status: "pending"
      }));
      await base44.entities.DocumentApproval.bulkCreate(newApprovals);



      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cc-projects'] });
      qc.invalidateQueries({ queryKey: ['cc-docs'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      // Danger: clear only seed-ish data by simple heuristics (contains "Seed"/"seed")
      const allProjects = await base44.entities.Project.list('-created_date', 500);
      const seededIds = allProjects.filter(p => (p.description||"").includes("Seeded project")).map(p => p.id);
      for (const pid of seededIds) {
        // delete docs/messages/invoices then project
        const pdocs = await base44.entities.ProjectDocument.filter({ project_id: pid }, '-created_date', 1000);
        for (const d of pdocs) { await base44.entities.ProjectDocument.delete(d.id); }
        const pmsgs = await base44.entities.ProjectMessage.filter({ project_id: pid }, '-created_date', 1000);
        for (const m of pmsgs) { await base44.entities.ProjectMessage.delete(m.id); }
        const pinv = await base44.entities.Invoice.filter({ project_id: pid }, '-created_date', 1000);
        for (const inv of pinv) { await base44.entities.Invoice.delete(inv.id); }
        await base44.entities.Project.delete(pid);
      }
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cc-projects'] });
      qc.invalidateQueries({ queryKey: ['cc-docs'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const canUse = !!selectedClient && !!selectedProject;

  return (
    <AdminRoute>
      <div className="py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Client Communications</h1>
                <p className="text-gray-600">Manage all client ↔ internal collaboration in one place</p>
              </div>
            </div>

            {/* Dev tools toggle for admins */}
            <NotificationBell />
            {currentUser?.role === 'admin' && (
              <Button variant="outline" onClick={() => setShowDevTools(v => !v)} className="gap-2">
                <Sparkles className="w-4 h-4" /> Dev Tools
              </Button>
            )}
          </div>



          {/* Scope selectors */}
          <Card className="p-4 border-0 shadow-lg mb-6">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Client</div>
                <Select value={selectedClient} onValueChange={(v) => { setSelectedClient(v); setSelectedProject(""); setSelectedDocId(null); }}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={clients.length ? "Select client" : (loadingProjects ? "Loading..." : "No clients") } />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.email} value={c.email}>{c.name} ({c.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Project</div>
                <Select value={selectedProject} onValueChange={(v) => { setSelectedProject(v); setSelectedDocId(null); }} disabled={!selectedClient}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={!selectedClient ? "Select a client first" : (clientProjects.length ? "Select project" : "No projects") } />
                  </SelectTrigger>
                  <SelectContent>
                    {clientProjects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-10 flex items-center">
                  <Users className="w-4 h-4 mr-2" /> {clients.length} clients
                </Badge>
                <Badge variant="outline" className="h-10 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" /> {clientProjects.length} projects
                </Badge>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 lg:grid-cols-14 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="proposals">Proposals</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="comms">Messages</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview">
              {!canUse ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client and a project to view collaboration details.</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 border-0 shadow-xl">
                    <div className="text-sm text-gray-600 mb-1">Documents</div>
                    <div className="text-3xl font-bold text-gray-900">{docs.length}</div>
                  </Card>
                  <Card className="p-6 border-0 shadow-xl">
                    <div className="text-sm text-gray-600 mb-1">Messages</div>
                    <div className="text-3xl font-bold text-gray-900">Live</div>
                  </Card>
                  <Card className="p-6 border-0 shadow-xl">
                    <div className="text-sm text-gray-600 mb-1">Invoices</div>
                    <div className="text-3xl font-bold text-gray-900">See tab</div>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents">
              {!canUse ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client and project to manage documents.</p>
                </Card>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Uploader + Filters + List */}
                  <div className="lg:col-span-1 space-y-6">
                    <DocumentUploader projectId={selectedProject} onUploadComplete={() => refetchDocs()} />

                    <Card className="p-4 border-0 shadow-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-blue-600" />
                        <div className="font-semibold">Documents ({docs.length})</div>
                      </div>
                      <div className="space-y-4 max-h-[520px] overflow-auto">
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-2">Construction Docs</div>
                          {loadingProjDocs ? (
                            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>
                          ) : projDocs.length === 0 ? (
                            <div className="p-3 text-sm text-gray-600 bg-gray-50 rounded-lg">No construction docs</div>
                          ) : (
                            projDocs.map((pd) => (
                              <button
                                key={`pdoc-${pd.id}`}
                                className={`w-full text-left p-3 rounded-lg border transition ${selectedDocKind==='pdoc' && selectedDocId===pd.id? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                onClick={() => { setSelectedDocId(pd.id); setSelectedDocKind('pdoc'); }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-gray-900 line-clamp-1">{pd.title || pd.doc_number || pd.doc_type}</div>
                                  <Badge variant="outline">{pd.doc_type}</Badge>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{pd.status}</div>
                              </button>
                            ))
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-2">Files</div>
                          {loadingDocs ? (
                            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>
                          ) : docs.length === 0 ? (
                            <div className="p-3 text-sm text-gray-600 bg-gray-50 rounded-lg">No files</div>
                          ) : (
                            docs.map((d) => (
                              <button
                                key={`f-${d.id}`}
                                className={`w-full text-left p-3 rounded-lg border transition ${selectedDocKind==='file' && selectedDocId===d.id? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                onClick={() => { setSelectedDocId(d.id); setSelectedDocKind('file'); }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-gray-900 line-clamp-1">{d.document_name}</div>
                                  <Badge variant="outline">{d.document_type}</Badge>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">v{d.version || '1.0'} • {(d.file_size ? (d.file_size/1024/1024).toFixed(2)+ ' MB' : '')}</div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right: Viewer + Annotate + Approvals */}
                  <div className="lg:col-span-2 space-y-6">
                    {selectedDocKind === 'pdoc' ? (
                      !selectedProjectDoc ? (
                        <Card className="p-8 border-0 shadow-xl">
                          <div className="text-gray-600">Select a construction doc from the list to view details.</div>
                        </Card>
                      ) : (
                        <>
                          <ConstructionDocumentViewer doc={selectedProjectDoc} projectId={selectedProject} />
                        </>
                      )
                    ) : (
                      !selectedDoc ? (
                        <Card className="p-8 border-0 shadow-xl">
                          <div className="text-gray-600">Select a document from the list to preview and manage annotations/approvals.</div>
                        </Card>
                      ) : (
                        <>
                          <Card className="p-6 border-0 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div className="font-bold text-gray-900">{selectedDoc.document_name}</div>
                                <Badge variant="outline">{selectedDoc.document_type}</Badge>
                              </div>
                              <a href={selectedDoc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">Open • Download</a>
                            </div>
                            <div className="aspect-video w-full bg-gray-50 rounded-lg border flex items-center justify-center text-gray-400">
                              Preview: open in new tab (PDF/images supported)
                            </div>
                          </Card>

                          <DocumentAnnotator document={selectedDoc} project={{ id: selectedProject }} user={currentUser || { email: 'internal@system', full_name: 'Internal User', role: 'admin' }} />

                          {/* If there is a pending approval for this doc, render the flow for current user */}
                          <PendingApproval docId={selectedDoc.id} user={currentUser} />

                          {selectedDoc.document_type === 'Contract' && (
                            <DocumentSigner 
                              documentId={selectedDoc.id}
                              documentType="contract"
                              projectId={selectedProject}
                              signerName={currentUser?.full_name}
                              signerEmail={currentUser?.email}
                              onSignComplete={() => qc.invalidateQueries({ queryKey: ['cc-docs', selectedProject] })}
                            />
                          )}
                        </>
                      )
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Communications Hub */}
            <TabsContent value="comms">
              {!canUse ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client and project to view messages.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Quick attach document to thread + template picker */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <AttachDocumentToThread docs={docs} projectId={selectedProject} />
                  </div>
                  <MessageThread
                    projectId={selectedProject}
                    projectName={clientProjects.find(p => p.id === selectedProject)?.project_name}
                    clientName={clients.find(c => c.email === selectedClient)?.name}
                  />
                </div>
              )}
            </TabsContent>

            {/* Invoices & Finance */}
            <TabsContent value="invoices">
              {!selectedClient ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client to review invoices.</p>
                </Card>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="p-6 border-0 shadow-xl">
                    <div className="font-bold text-gray-900 mb-2">Client View</div>
                    <ClientInvoices clientEmail={selectedClient} />
                  </Card>
                  <Card className="p-6 border-0 shadow-xl">
                    <div className="font-bold text-gray-900 mb-2">Internal Actions</div>
                    <InvoiceManager />
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Dashboard */}
            <TabsContent value="dashboard">
              {!selectedClient ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client to view their dashboard.</p>
                </Card>
              ) : (
                <ClientDashboard
                  projects={clientProjects}
                  pendingMilestones={[]}
                  pendingChangeOrders={[]}
                  recentDocuments={docs}
                  pendingProposals={[]}
                />
              )}
            </TabsContent>

            {/* Requests */}
            <TabsContent value="requests">
              {!selectedClient ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client to manage project requests.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="p-6 border-0 shadow-xl">
                    <ProjectRequestForm user={currentUser} onSuccess={() => { refetchRequests(); }} />
                  </Card>
                  <Card className="p-6 border-0 shadow-xl">
                    <div className="font-bold text-gray-900 mb-3">Project Requests</div>
                    <div className="space-y-2">
                      {projectRequests.length === 0 ? (
                        <div className="text-sm text-gray-600">No requests from this client.</div>
                      ) : (
                        projectRequests.map(req => (
                          <div key={req.id} className="p-3 rounded-lg border flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{req.request_title}</div>
                              <div className="text-xs text-gray-600">{req.project_type} • {req.status}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={()=>convertRequestToProject(req)}>Convert to Project</Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Projects */}
            <TabsContent value="projects">
              {!selectedClient ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client to view projects.</p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {clientProjects.map((p) => (
                    <ProjectProgressTracker key={p.id} project={p} milestones={[]} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Proposals */}
            <TabsContent value="proposals">
              {!selectedClient ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client to view proposals.</p>
                </Card>
              ) : (
                <Card className="p-6 border-0 shadow-xl">
                  <div className="font-bold text-gray-900 mb-3">Proposals</div>
                  <div className="space-y-2">
                    {proposals.length === 0 ? (
                      <div className="text-sm text-gray-600">No proposals for this project.</div>
                    ) : (
                      proposals.map(p => (
                        <div key={p.id} className="p-3 rounded-lg border flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{p.title}</div>
                            <div className="text-xs text-gray-600">{p.status} • ${p.amount || 0}</div>
                          </div>
                          <div className="flex gap-2">
                            {p.status !== 'signed' && (
                              <Button size="sm" onClick={()=>acceptProposalLinkToProject(p)}>Mark Accepted & Link</Button>
                            )}
                            <Button size="sm" variant="outline" onClick={()=>createContractFromProposal(p)}>Create Contract</Button>
                            <Button size="sm" variant="outline" onClick={()=>createInvoiceFromProposal(p)}>Create Invoice</Button>
                            <Button size="sm" variant="ghost" onClick={()=>{ setSelectedProposal(p); setViewingProposal(true); }}>Open</Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}
              </TabsContent>

            {/* Contracts */}
            <TabsContent value="contracts">
              {!selectedClient ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client to view contracts and approvals.</p>
                </Card>
              ) : (
                <ContractsApprovals user={currentUser} projects={clientProjects} />
              )}
            </TabsContent>

            {/* Approvals */}
            <TabsContent value="approvals">
              {!selectedClient ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client to view pending approvals.</p>
                </Card>
              ) : (
                <ContractsApprovals user={currentUser} projects={clientProjects} />
              )}
            </TabsContent>

            {/* Reports */}
            <TabsContent value="reports">
              <ReportScheduler
                projects={clientProjects.length > 0 ? clientProjects : projects}
                clients={clients}
                selectedClient={selectedClient}
                selectedProject={selectedProject}
              />
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              {!selectedClient ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client to view analytics.</p>
                </Card>
              ) : (
                <ClientAnalytics projects={clientProjects} documents={docs} projectMessages={[]} proposalMessages={[]} milestones={[]} changeOrders={[]} />
              )}
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile">
              {!selectedClient ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client to view profile.</p>
                </Card>
              ) : (
                <ClientProfileSettings user={currentUser} onUpdate={()=>{}} />
              )}
            </TabsContent>

            {/* Activity / Audit */}
            <TabsContent value="activity">
              {!selectedClient && !selectedProject ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-gray-700">Select a client or project to view activity.</p>
                </Card>
              ) : (
                <Card className="p-6 border-0 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <ActivityIcon className="w-4 h-4 text-blue-600" />
                    <div className="font-semibold">Recent Activity</div>
                  </div>
                  {loadingActivity ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>
                  ) : activity.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-600 bg-gray-50 rounded-lg">No activity yet</div>
                  ) : (
                    <div className="space-y-2">
                      {activity.map((a) => (
                        <div key={a.id} className="p-3 rounded-lg border border-gray-200 bg-white">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{a.activity_type || a.type}</div>
                            <div className="text-xs text-gray-500">{new Date(a.created_date).toLocaleString()}</div>
                          </div>
                          {(a.subject || a.description) && (
                            <div className="text-sm text-gray-700 mt-1">{a.subject || a.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Dev Tools (admin-only) */}
          {showDevTools && currentUser?.role === 'admin' && (
            <Card className="p-6 mt-8 border-2 border-dashed border-blue-300 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-gray-900 flex items-center gap-2"><Sparkles className="w-4 h-4" /> QA / Dev Utilities</div>
                <Badge className="bg-purple-600">Admin Only</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="bg-green-600 hover:bg-green-700">
                  {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Seed Test Data
                </Button>
                <Button onClick={() => resetMutation.mutate()} variant="destructive" disabled={resetMutation.isPending}>
                  {resetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Reset Test Data
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="text-sm text-gray-700 space-y-2">
                <div className="font-semibold">QA Checklist (use buttons/flows above):</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Upload doc (client emulation via Uploader) → verify appears, notify team</li>
                  <li>Add annotation → verify visible; mark resolved</li>
                  <li>Request approval → approve/deny/sign and verify notifications</li>
                  <li>Start chat in Communications → send messages, attach document link</li>
                  <li>Create/send Stripe invoice → status updates and Activity entries</li>
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}

function PendingApproval({ docId, user }) {
  const { data: approvals = [] } = useQuery({
    queryKey: ['pending-approvals', docId],
    queryFn: async () => await base44.entities.DocumentApproval.filter({ document_id: docId }, '-created_date', 50),
    enabled: !!docId,
    initialData: []
  });
  const pending = approvals.find(a => a.status === 'pending');
  if (!pending) return null;
  return (
    <DocumentApprovalFlow approval={pending} user={user || { full_name: 'Internal User', email: 'internal@system' }} onComplete={() => {}} />
  );
}

function AttachDocumentToThread({ docs = [], projectId }) {
  const qc = useQueryClient();
  const [docId, setDocId] = useState("");
  const [sending, setSending] = useState(false);
  const send = async () => {
    if (!docId || !projectId) return;
    setSending(true);
    const user = await base44.auth.me();
    const doc = docs.find(d => d.id === docId);
    const text = `Attached document: ${doc.document_name} → ${doc.file_url}`;
    await base44.entities.ProjectMessage.create({
      project_id: projectId,
      message: text,
      sender_email: user.email,
      sender_name: user.full_name,
      is_internal: true
    });
    setSending(false);
    setDocId("");
    qc.invalidateQueries({ queryKey: ['project-messages', projectId] });
  };
  return (
    <Card className="p-4 border-0 shadow-lg">
      <div className="flex items-center gap-3">
        <Select value={docId} onValueChange={setDocId}>
          <SelectTrigger className="w-full md:w-96">
            <SelectValue placeholder="Attach a document to this thread" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {docs.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.document_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={send} disabled={!docId || sending} className="bg-indigo-600">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />} Share to Thread
        </Button>
      </div>
    </Card>
  );
}