import React from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, FileText, Sparkles, Save, Edit, Trash2, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ProjectReportGenerator from "@/components/projects/ProjectReportGenerator";
import AIRiskAssistant from "@/components/projects/AIRiskAssistant";
import TemplateSuiteTabs from "@/components/projectDocs/templateBuilder/TemplateSuiteTabs.tsx";
import RFIForm from "@/components/rfi/RFIForm";
import RFIView from "@/components/rfi/RFIView";
import { rfiApi } from "@/components/services/rfiApiClient";
import AdminRoute from "@/components/internal/AdminRoute";
import DocList from "@/components/projectDocs/DocList";
import ClientProjectFilter from "@/components/common/ClientProjectFilter";
import DocForm from "@/components/projectDocs/DocForm";
import DocView from "@/components/projectDocs/DocView";
import TemplatePicker from "@/components/projectDocs/TemplatePicker";
import InlineBuilder from "@/components/projectDocs/InlineBuilder";
import GanttChart from "@/components/projects/GanttChart";
import KanbanBoard from "@/components/projects/KanbanBoard";
import ResourceAllocation from "@/components/projects/ResourceAllocation";

import { projectDocsApi } from "@/components/services/projectDocsApiClient";

import { createPageUrl } from "@/utils";

export default function ProjectManager() {
  const [active, setActive] = React.useState('docs');
  const [creatingDocType, setCreatingDocType] = React.useState(null);
  const [selectedDoc, setSelectedDoc] = React.useState(null);
  const [scope, setScope] = React.useState({ clientEmail: null, projectId: null });

  const qc = useQueryClient();

  // --- Projects Manager state ---
  const [editingProject, setEditingProject] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedProjectForAnalysis, setSelectedProjectForAnalysis] = React.useState(null);
  const [formData, setFormData] = React.useState({
    project_name: "",
    project_number: "",
    client_email: "",
    client_name: "",
    project_type: "SWPPP",
    status: "Planning",
    priority: "Medium",
    start_date: "",
    estimated_completion: "",
    location: "",
    description: "",
    budget: 0,
    assigned_team_members: [],
    notes: ""
  });

  // --- Queries ---
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 200),
    initialData: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const { data: allDocuments = [] } = useQuery({
    queryKey: ['project-documents-all'],
    queryFn: () => base44.entities.ProjectDocument.list('-created_date', 1000),
    initialData: []
  });

  const { data: allMilestones = [] } = useQuery({
    queryKey: ['project-milestones-all'],
    queryFn: () => base44.entities.ProjectMilestone.list('-created_date', 1000),
    initialData: []
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['project-messages-all'],
    queryFn: () => base44.entities.ProjectMessage.list('-created_date', 1000),
    initialData: []
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['pm-tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 500),
    initialData: []
  });

  // --- Mutations ---
  const saveProjectMutation = useMutation({
    mutationFn: async (data) => {
      if (editingProject?.id) {
        return await base44.entities.Project.update(editingProject.id, data);
      } else {
        return await base44.entities.Project.create(data);
      }
    },
    onSuccess: () => {
      toast.success(editingProject ? 'Project updated' : 'Project created');
      qc.invalidateQueries({ queryKey: ['projects'] });
      resetForm();
    },
    onError: (e) => {
      toast.error(`Failed to save project: ${e?.message || 'Unknown error'}`);
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      toast.success('Project deleted');
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (e) => {
      toast.error(`Failed to delete: ${e?.message || 'Unknown error'}`);
    }
  });

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      project_name: "",
      project_number: "",
      client_email: "",
      client_name: "",
      project_type: "SWPPP",
      status: "Planning",
      priority: "Medium",
      start_date: "",
      estimated_completion: "",
      location: "",
      description: "",
      budget: 0,
      assigned_team_members: [],
      notes: ""
    });
  };

  const editProject = (project) => {
    setEditingProject(project);
    setFormData(project);
  };

  const filteredProjects = projects.filter(project => {
    const scopeClient = !scope.clientEmail || (project.client_email === scope.clientEmail);
    const scopeProject = !scope.projectId || (project.id === scope.projectId);
    if (!scopeClient || !scopeProject) return false;
    const matchesSearch = project.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.project_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const createDoc = useMutation({
    mutationFn: async (arg) => {
      const hasWrapper = arg && typeof arg === 'object' && 'data' in arg;
      const data = hasWrapper ? arg.data : arg;
      const files = hasWrapper ? (arg.files || []) : [];
      const created = await projectDocsApi.create(data);
      if (files && files.length) {
        for (const file of files) {
          try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            await base44.functions.invoke('processAttachment', {
              doc_id: created.id,
              file_url,
              name: file.name,
              size: file.size,
              mime_type: file.type,
            });
          } catch (e) {
            console.error('Attachment upload failed', e);
            toast.error(`Failed to process attachment ${file.name}`);
          }
        }
      }
      return created;
    },
    onSuccess: () => {
      toast.success('Document created');
      setCreatingDocType(null);
      qc.invalidateQueries({ queryKey: ['project_docs'] });
    },
    onError: (e) => {
      toast.error(`Failed to create document: ${e?.message || 'Unknown error'}`);
    }
  });

  return (
    <AdminRoute>
      <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Project Manager</h1>
        <div className="flex-1 min-w-[320px]">
          {/* Local, project-scoped filter/search */}
          <ClientProjectFilter projects={projects} value={scope} onChange={setScope} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={()=>{ window.location.href = createPageUrl('PageBuilder?from=ProjectManager'); }}>Open Full Page Builder</Button>
        </div>
      </div>

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="flex flex-wrap gap-1 mb-6">
          <TabsTrigger value="projects"><Building2 className="w-4 h-4 mr-2" />Projects</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
          <TabsTrigger value="reports"><FileText className="w-4 h-4 mr-2" />Reports</TabsTrigger>
          <TabsTrigger value="Risk Analysis Report"><Sparkles className="w-4 h-4 mr-2" />Risk Analysis</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="w-4 h-4 mr-2" />Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-8 border-0 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingProject ? "Edit Project" : "Create Project"}
                </h2>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Project Name *</Label>
                      <Input
                        value={formData.project_name}
                        onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                        placeholder="Downtown SWPPP Project"
                      />
                    </div>
                    <div>
                      <Label>Project Number</Label>
                      <Input
                        value={formData.project_number}
                        onChange={(e) => setFormData({...formData, project_number: e.target.value})}
                        placeholder="PROJ-2024-001"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Client Name *</Label>
                      <Input
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        placeholder="ABC Construction"
                      />
                    </div>
                    <div>
                      <Label>Client Email *</Label>
                      <Input
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                        placeholder="client@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Project Type</Label>
                      <Select value={formData.project_type} onValueChange={(value) => setFormData({...formData, project_type: value})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SWPPP">SWPPP</SelectItem>
                          <SelectItem value="Construction">Construction</SelectItem>
                          <SelectItem value="Inspections">Inspections</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Special Inspections">Special Inspections</SelectItem>
                          <SelectItem value="Multiple Services">Multiple Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="Under Review">Under Review</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                    </div>
                    <div>
                      <Label>Estimated Completion</Label>
                      <Input type="date" value={formData.estimated_completion} onChange={(e) => setFormData({...formData, estimated_completion: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="San Francisco, CA" />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                  </div>

                  <div>
                    <Label>Budget ($)</Label>
                    <Input type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})} />
                  </div>

                  <div>
                    <Label>Internal Notes</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} />
                  </div>

                  <div className="flex gap-3 pt-4">
                    {editingProject && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
                    <Button
                      onClick={() => saveProjectMutation.mutate(formData)}
                      disabled={!formData.project_name || !formData.client_name || !formData.client_email}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingProject ? "Update" : "Create"} Project
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6 border-0 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Projects</h3>
                  <Badge className="bg-blue-100 text-blue-800">{filteredProjects.length}</Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredProjects.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-600 bg-slate-50 rounded-lg border">
                      No projects match your filters. Create a new one on the left or clear filters above.
                    </div>
                  )}
                  {filteredProjects.map(project => (
                    <div key={project.id} className="border rounded-lg p-3 hover:bg-blue-50 cursor-pointer" onClick={() => editProject(project)}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{project.project_name}</h4>
                          <p className="text-xs text-gray-600">{project.client_name}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{project.project_type}</Badge>
                            <Badge className={project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); editProject(project); }}>
                          <Edit className="w-3 h-3 mr-1" />Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) deleteProjectMutation.mutate(project.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <GanttChart projects={filteredProjects} />
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanBoard tasks={allTasks} queryKey="pm-tasks" />
          <div className="text-xs text-gray-400 mt-2">Drag and drop tasks between columns to update their status.</div>
        </TabsContent>

        <TabsContent value="resources">
          <ResourceAllocation projects={filteredProjects} tasks={allTasks} users={users} />
        </TabsContent>

        <TabsContent value="reports">
          <ProjectReportGenerator clientName={scope.clientEmail ? (projects.find(p=>p.client_email===scope.clientEmail)?.client_name || "") : ""} />
        </TabsContent>

        <TabsContent value="Risk Analysis Report">
          <div className="space-y-6">
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Project to Generate Risk Analysis Report</h3>
              <Select 
                value={selectedProjectForAnalysis?.id || ""} 
                onValueChange={(projectId) => {
                  const project = projects.find(p => p.id === projectId);
                  setSelectedProjectForAnalysis(project);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects
                    .filter(p => !scope.clientEmail || p.client_email === scope.clientEmail)
                    .map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.project_name} - {p.client_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Card>

            {selectedProjectForAnalysis && (
              <AIRiskAssistant
                project={selectedProjectForAnalysis}
                documents={allDocuments.filter(d => d.project_id === selectedProjectForAnalysis.id)}
                milestones={allMilestones.filter(m => m.project_id === selectedProjectForAnalysis.id)}
                messages={allMessages.filter(m => m.project_id === selectedProjectForAnalysis.id)}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          {!creatingDocType && !selectedDoc && (
            <DocList
              clientEmail={scope.clientEmail}
              projectId={scope.projectId}
              onCreate={(type)=>setCreatingDocType(type)}
              onOpen={(payload)=>{
                if (!payload) return;
                setSelectedDoc(payload);
              }}
              onEdit={(payload)=>{
                setSelectedDoc(payload);
              }}
            />
          )}

          {creatingDocType && creatingDocType !== 'RFI' && (
            <DocForm onCancel={()=>setCreatingDocType(null)} onSubmit={(data)=>createDoc.mutate(data)} initial={{ doc_type: creatingDocType }} />
          )}
          {creatingDocType === 'RFI' && (
            <RFIForm 
              onCancel={()=>setCreatingDocType(null)} 
              onSubmit={async (payload)=>{ await rfiApi.create(payload); setCreatingDocType(null); qc.invalidateQueries({ queryKey: ['rfis'] }); }} 
            />
          )}

          {selectedDoc && selectedDoc.kind === 'RFI' && (
            <RFIView 
              rfi={selectedDoc.item}
              onRefresh={()=>{ setSelectedDoc(null); qc.invalidateQueries({ queryKey: ['rfis'] }); }}
            />
          )}
          {selectedDoc && selectedDoc.kind !== 'RFI' && (
            <DocView
              doc={selectedDoc.item || selectedDoc}
              onBack={()=>setSelectedDoc(null)}
              onRefresh={()=>{ setSelectedDoc(null); setTimeout(()=>setSelectedDoc(selectedDoc), 0); }}
            />
          )}
        </TabsContent>



        <TabsContent value="templates" className="mt-4 space-y-6">
          <div className="mb-6">
            <TemplateSuiteTabs />
          </div>
          <div>
            <h2 className="font-semibold mb-2">Templates by Type</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {['RFQ','RFP','Submittal','ASI','CCD','RFC','FieldReport','RFI'].map((t)=>(
                <div key={t} className="space-y-2">
                  <div className="text-sm font-medium">{t}</div>
                  <TemplatePicker docType={t} onSelect={()=>{ setActive('docs'); setCreatingDocType(t); }} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Inline Template Builder</h2>
            <InlineBuilder docType="RFQ" onSaved={()=>{}} />
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminRoute>
  );
}