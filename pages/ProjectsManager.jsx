import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import AdminRoute from "../components/internal/AdminRoute";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Edit, Trash2, FolderOpen, Search, Filter, Building2, FileText, Sparkles } from "lucide-react";
import { format } from "date-fns";
import ProjectReportGenerator from "../components/projects/ProjectReportGenerator";
import AIRiskAssistant from "../components/projects/AIRiskAssistant";
import TemplateSuiteTabs from "@/components/projectDocs/templateBuilder/TemplateSuiteTabs.tsx";

export default function ProjectsManager() {
  const queryClient = useQueryClient();
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProjectForAnalysis, setSelectedProjectForAnalysis] = useState(null);
  const [formData, setFormData] = useState({
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

  const saveProjectMutation = useMutation({
    mutationFn: async (data) => {
      if (editingProject?.id) {
        return await base44.entities.Project.update(editingProject.id, data);
      } else {
        return await base44.entities.Project.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      resetForm();
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
    const matchesSearch = project.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.project_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminRoute>
      
        <div className="py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Project Management</h1>
              <p className="text-gray-600 text-lg">Manage projects, generate reports, and analyze risks</p>
            </div>

            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 mb-6">
                <TabsTrigger value="projects">
                  <Building2 className="w-4 h-4 mr-2" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="reports">
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="Risk Analysis Report">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Risk Analysis Report
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <FileText className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
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

              <TabsContent value="reports">
                <ProjectReportGenerator />
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
                        {projects.map(p => (
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
              <TabsContent value="templates">
                <TemplateSuiteTabs />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      
    </AdminRoute>
  );
}