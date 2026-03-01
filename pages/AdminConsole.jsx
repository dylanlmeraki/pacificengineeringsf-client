import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminRoute from "../components/internal/AdminRoute";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings,
  Mail,
  Zap,
  FileText,
  Workflow as WorkflowIcon,
  Plus,
  Trash2,
  Play,
  Pause,
  Edit,
  Save,
  X,
  ChevronRight,
  Clock,
  CheckSquare,
  FileEdit,
  MessageSquare,
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
  Download,
  Eye,
  Send,
  Loader2,
  Beaker,
  Shield,
  Users
} from "lucide-react";

import SeedPanel from "../components/qaqc/SeedPanel.jsx";
import FunctionTester from "../components/qaqc/FunctionTester.jsx";
import QAChecklist from "../components/qaqc/QAChecklist.jsx";

import UserManagementPanel from "../components/admin/UserManagementPanel.jsx";

export default function AdminConsole() {
  return (
    <AdminRoute>
      
        <div className="py-6 lg:py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Settings className="w-10 h-10 text-blue-600" />
              Admin Console
            </h1>
            <p className="text-gray-600 text-lg">
              System configuration, email settings, workflows, and automation
            </p>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" />
                Email Settings
              </TabsTrigger>
              <TabsTrigger value="workflows">
                <WorkflowIcon className="w-4 h-4 mr-2" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="qaqc">
                <Beaker className="w-4 h-4 mr-2" />
                QA / QC
              </TabsTrigger>
              <TabsTrigger value="pdf">
                <FileText className="w-4 h-4 mr-2" />
                PDF Generator
              </TabsTrigger>
            </TabsList>

            {/* Email Settings Tab */}
            <TabsContent value="email">
              <EmailSettingsSection />
            </TabsContent>

            {/* Workflows Tab */}
            <TabsContent value="workflows">
              <WorkflowsSection />
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users">
              <UserManagementPanel />
            </TabsContent>

            {/* QA / QC Tab */}
            <TabsContent value="qaqc">
              <QAQCSection />
            </TabsContent>

            {/* PDF Generator Tab */}
            <TabsContent value="pdf">
              <PDFGeneratorSection />
            </TabsContent>
          </Tabs>
        </div>
      
    </AdminRoute>
  );
}

// QA/QC Section Component
function QAQCSection() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Beaker className="w-6 h-6 text-blue-600" /> Internal QA / QC
        </h2>
        <p className="text-gray-600">Seed realistic data, test critical functions, and run the QA checklist.</p>
      </div>

      <Tabs defaultValue="data">
        <TabsList className="mb-6">
          <TabsTrigger value="data">Test Data</TabsTrigger>
          <TabsTrigger value="functions">Function Tests</TabsTrigger>
          <TabsTrigger value="checklist">QA Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="data">
          <SeedPanel />
        </TabsContent>

        <TabsContent value="functions">
          <FunctionTester />
        </TabsContent>

        <TabsContent value="checklist">
          <QAChecklist />
          <Card className="p-6 mt-6 border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white">
            <div className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><Shield className="w-4 h-4" /> Notes</div>
            <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
              <li>All actions write to persistent storage and reflect in ActivityLog when applicable.</li>
              <li>Use admin account for seeding and backend function tests.</li>
              <li>This module is internal-only and safe for dev/QA environments.</li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Email Settings Section Component
function EmailSettingsSection() {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    setting_name: "",
    recipient_emails: [""],
    form_type: "swppp_consultation",
    active: true
  });

  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['emailSettings'],
    queryFn: () => base44.entities.EmailSettings.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailSettings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
    }
  });

  const resetForm = () => {
    setFormData({
      setting_name: "",
      recipient_emails: [""],
      form_type: "swppp_consultation",
      active: true
    });
    setEditingId(null);
  };

  const handleEdit = (setting) => {
    setFormData({
      setting_name: setting.setting_name,
      recipient_emails: setting.recipient_emails,
      form_type: setting.form_type,
      active: setting.active
    });
    setEditingId(setting.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredEmails = formData.recipient_emails.filter(email => email.trim() !== "");
    
    if (filteredEmails.length === 0) {
      alert("Please add at least one email address");
      return;
    }

    const data = { ...formData, recipient_emails: filteredEmails };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addEmailField = () => {
    setFormData({ ...formData, recipient_emails: [...formData.recipient_emails, ""] });
  };

  const updateEmail = (index, value) => {
    const newEmails = [...formData.recipient_emails];
    newEmails[index] = value;
    setFormData({ ...formData, recipient_emails: newEmails });
  };

  const removeEmail = (index) => {
    const newEmails = formData.recipient_emails.filter((_, i) => i !== index);
    setFormData({ ...formData, recipient_emails: newEmails });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="p-6 border-0 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editingId ? "Edit Email Setting" : "Add Email Setting"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Setting Name</Label>
            <Input
              value={formData.setting_name}
              onChange={(e) => setFormData({ ...formData, setting_name: e.target.value })}
              placeholder="e.g., SWPPP Form Recipients"
              required
            />
          </div>

          <div>
            <Label>Form Type</Label>
            <Select
              value={formData.form_type}
              onValueChange={(value) => setFormData({ ...formData, form_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="swppp_consultation">SWPPP Consultation</SelectItem>
                <SelectItem value="contact_form">Contact Form</SelectItem>
                <SelectItem value="general_inquiry">General Inquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Recipient Emails</Label>
              <Button type="button" size="sm" variant="outline" onClick={addEmailField}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.recipient_emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="email@example.com"
                  />
                  {formData.recipient_emails.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeEmail(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="active" className="cursor-pointer">Active</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Current Settings</h2>
        
        {isLoading ? (
          <Card className="p-6 text-center text-gray-500 border-0 shadow-lg">Loading...</Card>
        ) : settings.length === 0 ? (
          <Card className="p-6 text-center text-gray-500 border-0 shadow-lg">
            No email settings configured yet
          </Card>
        ) : (
          settings.map((setting) => (
            <Card key={setting.id} className="p-6 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{setting.setting_name}</h3>
                  <p className="text-sm text-gray-600">{setting.form_type}</p>
                  {!setting.active && (
                    <Badge className="mt-1 bg-gray-200 text-gray-700">
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(setting)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this email setting?")) {
                        deleteMutation.mutate(setting.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm text-gray-600">Recipients:</Label>
                {setting.recipient_emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{email}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Workflows Section Component
function WorkflowsSection() {
  const queryClient = useQueryClient();
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list('-created_date', 100),
    initialData: []
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data) => base44.entities.Workflow.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setShowBuilder(false);
      setEditingWorkflow(null);
    }
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workflow.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setShowBuilder(false);
      setEditingWorkflow(null);
    }
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (id) => base44.entities.Workflow.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.Workflow.update(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });

  const startNewWorkflow = () => {
    setEditingWorkflow({
      name: "",
      description: "",
      active: true,
      trigger_type: "status_change",
      trigger_config: { from_status: "", to_status: "Qualified" },
      steps: []
    });
    setShowBuilder(true);
  };

  const startEditWorkflow = (workflow) => {
    setEditingWorkflow(workflow);
    setShowBuilder(true);
  };

  const triggerIcons = {
    status_change: Target,
    date_based: Calendar,
    score_threshold: TrendingUp,
    interaction_added: MessageSquare,
    task_completed: CheckSquare
  };

  const actionIcons = {
    create_task: CheckSquare,
    send_email: Mail,
    update_prospect: FileEdit,
    wait_days: Clock,
    create_interaction: MessageSquare
  };

  if (showBuilder) {
    return (
      <WorkflowBuilderForm
        workflow={editingWorkflow}
        onSave={(data) => {
          if (editingWorkflow?.id) {
            updateWorkflowMutation.mutate({ id: editingWorkflow.id, data });
          } else {
            createWorkflowMutation.mutate(data);
          }
        }}
        onCancel={() => {
          setShowBuilder(false);
          setEditingWorkflow(null);
        }}
        isSaving={createWorkflowMutation.isPending || updateWorkflowMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Automation</h2>
          <p className="text-gray-600">Create custom multi-step processes triggered by prospect events</p>
        </div>
        <Button
          onClick={startNewWorkflow}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Workflow
        </Button>
      </div>

      <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Quick Start Templates
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              name: "Qualified Lead Workflow",
              trigger: "Status → Qualified",
              actions: "Create follow-up task • Send proposal email • Update deal stage"
            },
            {
              name: "Meeting Scheduled Prep",
              trigger: "Status → Meeting Scheduled",
              actions: "Create prep task • Wait 1 day • Send reminder email"
            },
            {
              name: "Hot Lead Alert",
              trigger: "Engagement Score ≥ 70",
              actions: "Update segment • Create urgent task • Send notification"
            }
          ].map((template, idx) => (
            <Card key={idx} className="p-4 border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer bg-white">
              <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-medium">Trigger:</span> {template.trigger}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Actions:</span> {template.actions}
              </p>
            </Card>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-12 text-center border-0 shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading workflows...</p>
          </Card>
        ) : workflows.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-lg">
            <WorkflowIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No workflows created yet</p>
            <Button onClick={startNewWorkflow}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Workflow
            </Button>
          </Card>
        ) : (
          workflows.map((workflow) => {
            const TriggerIcon = triggerIcons[workflow.trigger_type] || Target;
            
            return (
              <Card key={workflow.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-xl">{workflow.name}</h3>
                      <Badge className={workflow.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {workflow.active ? "Active" : "Paused"}
                      </Badge>
                      {workflow.execution_count > 0 && (
                        <Badge variant="outline">{workflow.execution_count} executions</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{workflow.description}</p>
                    
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <TriggerIcon className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-gray-900">Trigger:</span>
                        <span className="text-gray-700">
                          {workflow.trigger_type === "status_change" && 
                            `Status changes to ${workflow.trigger_config?.to_status}`}
                          {workflow.trigger_type === "date_based" && 
                            `Date field ${workflow.trigger_config?.date_field} is reached`}
                          {workflow.trigger_type === "score_threshold" && 
                            `${workflow.trigger_config?.score_field} reaches ${workflow.trigger_config?.threshold}`}
                          {workflow.trigger_type === "interaction_added" && 
                            `New interaction of type ${workflow.trigger_config?.interaction_type || "any"}`}
                          {workflow.trigger_type === "task_completed" && 
                            `Task of type ${workflow.trigger_config?.task_type || "any"} completed`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-700">Actions:</span>
                      {workflow.steps?.map((step, idx) => {
                        const ActionIcon = actionIcons[step.action_type] || Zap;
                        return (
                          <React.Fragment key={idx}>
                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                              <ActionIcon className="w-3 h-3 text-gray-600" />
                              <span className="text-xs text-gray-700">
                                {step.action_type.replace(/_/g, ' ')}
                              </span>
                            </div>
                            {idx < workflow.steps.length - 1 && (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWorkflowMutation.mutate({ id: workflow.id, active: !workflow.active })}
                    >
                      {workflow.active ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditWorkflow(workflow)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete workflow "${workflow.name}"?`)) {
                          deleteWorkflowMutation.mutate(workflow.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// PDF Generator Section Component
function PDFGeneratorSection() {
  const [selectedPage, setSelectedPage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [isCheckingChanges, setIsCheckingChanges] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  const { data: monitors = [], refetch: refetchMonitors } = useQuery({
    queryKey: ['websiteMonitors'],
    queryFn: () => base44.entities.WebsiteMonitor.list('-last_checked_date', 100),
    initialData: [],
    refetchInterval: 60000
  });

  const pages = [
    { value: "Home", label: "Home Page" },
    { value: "Services", label: "Services Overview" },
    { value: "About", label: "About Us" },
    { value: "Contact", label: "Contact" },
    { value: "Blog", label: "Blog" }
  ];

  const handleGenerate = async () => {
    if (!selectedPage) {
      alert("Please select a page");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus(null);

    try {
      const response = await base44.functions.invoke('generateAndEmailPDFs', {
        pageNames: [selectedPage]
      });

      setGenerationStatus({
        success: true,
        message: response.data.message || "PDFs generated and emailed successfully"
      });
    } catch (error) {
      setGenerationStatus({
        success: false,
        message: error.message || "Failed to generate PDFs"
      });
    }

    setIsGenerating(false);
  };

  const handleCheckChanges = async () => {
    setIsCheckingChanges(true);
    setCheckResult(null);

    try {
      const response = await base44.functions.invoke('monitorWebsiteChanges');
      
      await refetchMonitors();
      
      setCheckResult({
        success: true,
        data: response.data
      });
    } catch (error) {
      setCheckResult({
        success: false,
        message: error.message || "Failed to check website changes"
      });
    }

    setIsCheckingChanges(false);
  };

  const totalChecks = monitors.reduce((sum, m) => sum + (m.check_count || 0), 0);
  const totalChanges = monitors.reduce((sum, m) => sum + (m.change_count || 0), 0);
  const activeMonitors = monitors.filter(m => m.status === "active").length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="generator">PDF Generation</TabsTrigger>
          <TabsTrigger value="monitor">Website Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate & Email PDFs</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Select Page</Label>
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a page..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map(page => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedPage}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating PDFs...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate & Email PDFs
                  </>
                )}
              </Button>

              {generationStatus && (
                <Card className={`p-4 ${generationStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-sm ${generationStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                    {generationStatus.message}
                  </p>
                </Card>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Website Change Monitoring</h2>
                <p className="text-gray-600 mt-1">Track changes to your public website pages</p>
              </div>
              <Button
                onClick={handleCheckChanges}
                disabled={isCheckingChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCheckingChanges ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Check Now
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="text-2xl font-bold text-blue-900">{totalChecks}</div>
                <div className="text-sm text-blue-700">Total Checks</div>
              </Card>
              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="text-2xl font-bold text-orange-900">{totalChanges}</div>
                <div className="text-sm text-orange-700">Changes Detected</div>
              </Card>
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="text-2xl font-bold text-green-900">{activeMonitors}</div>
                <div className="text-sm text-green-700">Active Monitors</div>
              </Card>
            </div>

            {checkResult && (
              <Card className={`p-4 mb-6 ${checkResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-sm font-semibold ${checkResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {checkResult.success ? 
                    `Checked ${checkResult.data?.pagesChecked || 0} pages. ${checkResult.data?.changesDetected || 0} changes detected.` :
                    checkResult.message
                  }
                </p>
              </Card>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Page</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Checked</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monitors.map(monitor => (
                    <tr key={monitor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{monitor.page_name}</td>
                      <td className="px-4 py-3">
                        <Badge className={
                          monitor.status === "active" ? "bg-green-100 text-green-700" :
                          monitor.status === "changed" ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-700"
                        }>
                          {monitor.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {monitor.last_checked_date ? new Date(monitor.last_checked_date).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{monitor.change_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Workflow Builder Form (extracted for workflow editing)
function WorkflowBuilderForm({ workflow, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState(workflow);

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...(formData.steps || []), { action_type: "create_task", action_config: {} }]
    });
  };

  const updateStep = (index, updates) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="p-8 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          {workflow?.id ? "Edit Workflow" : "Create New Workflow"}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Workflow Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Qualified Lead Follow-Up"
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What does this workflow do?"
            rows={2}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Trigger
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trigger Type</label>
              <Select 
                value={formData.trigger_type} 
                onValueChange={(value) => setFormData({ ...formData, trigger_type: value, trigger_config: {} })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status_change">Prospect Status Change</SelectItem>
                  <SelectItem value="date_based">Date/Time Based</SelectItem>
                  <SelectItem value="score_threshold">Score Threshold</SelectItem>
                  <SelectItem value="interaction_added">New Interaction</SelectItem>
                  <SelectItem value="task_completed">Task Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.trigger_type === "status_change" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">When Status Changes To</label>
                <Select
                  value={formData.trigger_config?.to_status}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    trigger_config: { ...formData.trigger_config, to_status: value }
                  })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Engaged">Engaged</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Meeting Scheduled">Meeting Scheduled</SelectItem>
                    <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.trigger_type === "score_threshold" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Score Field</label>
                  <Select
                    value={formData.trigger_config?.score_field}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      trigger_config: { ...formData.trigger_config, score_field: value }
                    })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect_score">Overall Score</SelectItem>
                      <SelectItem value="engagement_score">Engagement Score</SelectItem>
                      <SelectItem value="fit_score">Fit Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Threshold Value</label>
                  <Input
                    type="number"
                    value={formData.trigger_config?.threshold || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      trigger_config: { ...formData.trigger_config, threshold: parseInt(e.target.value) }
                    })}
                    placeholder="70"
                    className="h-12"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <WorkflowIcon className="w-5 h-5 text-purple-600" />
              Actions ({formData.steps?.length || 0})
            </h3>
            <Button onClick={addStep} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Action
            </Button>
          </div>

          <div className="space-y-4">
            {formData.steps?.map((step, index) => (
              <StepEditor
                key={index}
                step={step}
                index={index}
                onChange={(updates) => updateStep(index, updates)}
                onRemove={() => removeStep(index)}
              />
            ))}

            {(!formData.steps || formData.steps.length === 0) && (
              <Card className="p-8 text-center bg-gray-50 border-0">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">No actions added yet</p>
                <Button onClick={addStep} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Action
                </Button>
              </Card>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={isSaving || !formData.name || !formData.trigger_type || !formData.steps?.length}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Workflow
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StepEditor({ step, index, onChange, onRemove }) {
  return (
    <Card className="p-4 border-2 border-purple-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
          {index + 1}
        </div>
        
        <div className="flex-1 space-y-3">
          <Select
            value={step.action_type}
            onValueChange={(value) => onChange({ action_type: value, action_config: {} })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="create_task">Create Task</SelectItem>
              <SelectItem value="send_email">Send Email</SelectItem>
              <SelectItem value="update_prospect">Update Prospect Field</SelectItem>
              <SelectItem value="wait_days">Wait (Days)</SelectItem>
              <SelectItem value="create_interaction">Log Interaction</SelectItem>
            </SelectContent>
          </Select>

          {step.action_type === "create_task" && (
            <div className="space-y-2">
              <Input
                placeholder="Task title"
                value={step.action_config?.title || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, title: e.target.value }
                })}
              />
              <Select
                value={step.action_config?.task_type}
                onValueChange={(value) => onChange({
                  action_config: { ...step.action_config, task_type: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Follow-up Call">Follow-up Call</SelectItem>
                  <SelectItem value="Follow-up Email">Follow-up Email</SelectItem>
                  <SelectItem value="Send Proposal">Send Proposal</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step.action_type === "send_email" && (
            <div className="space-y-2">
              <Input
                placeholder="Email subject"
                value={step.action_config?.subject || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, subject: e.target.value }
                })}
              />
              <Textarea
                placeholder="Email body (use {{prospect_name}}, {{company_name}} for variables)"
                value={step.action_config?.body || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, body: e.target.value }
                })}
                rows={3}
              />
            </div>
          )}

          {step.action_type === "update_prospect" && (
            <div className="grid md:grid-cols-2 gap-2">
              <Input
                placeholder="Field name (e.g., segment)"
                value={step.action_config?.field || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, field: e.target.value }
                })}
              />
              <Input
                placeholder="New value"
                value={step.action_config?.value || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, value: e.target.value }
                })}
              />
            </div>
          )}

          {step.action_type === "wait_days" && (
            <Input
              type="number"
              placeholder="Number of days"
              value={step.action_config?.days || ""}
              onChange={(e) => onChange({
                action_config: { ...step.action_config, days: parseInt(e.target.value) }
              })}
            />
          )}
        </div>

        <Button variant="outline" size="sm" onClick={onRemove}>
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    </Card>
  );
}