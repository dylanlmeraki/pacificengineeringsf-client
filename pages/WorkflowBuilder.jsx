import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import AdminRoute from "../components/internal/AdminRoute";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Workflow as WorkflowIcon,
  Plus,
  Trash2,
  Play,
  Pause,
  Edit,
  Save,
  X,
  ChevronRight,
  Zap,
  Clock,
  Mail,
  CheckSquare,
  FileEdit,
  MessageSquare,
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
  Eye,
  Sparkles
} from "lucide-react";
import VisualWorkflowCanvas from "@/components/workflow/VisualWorkflowCanvas";
import AIWorkflowSuggestions from "@/components/workflow/AIWorkflowSuggestions";

export default function WorkflowBuilder() {
  const queryClient = useQueryClient();
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const [previewWorkflow, setPreviewWorkflow] = useState(null);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list('-created_date', 100),
    initialData: []
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['wf-projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 200),
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

  const startNewWorkflow = (template = null) => {
    if (template) {
      setEditingWorkflow(template);
    } else {
      setEditingWorkflow({
        name: "",
        description: "",
        active: true,
        workflow_type: "crm",
        trigger_type: "status_change",
        trigger_config: { from_status: "", to_status: "Qualified" },
        steps: []
      });
    }
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
    task_completed: CheckSquare,
    milestone_completed: CheckSquare,
    document_approved: FileEdit,
    invoice_overdue: AlertCircle,
    proposal_signed: FileEdit,
    project_status_change: Target,
    change_order_approved: CheckSquare,
    project_created: Zap
  };

  const actionIcons = {
    create_task: CheckSquare,
    send_email: Mail,
    update_prospect: FileEdit,
    wait_days: Clock,
    create_interaction: MessageSquare,
    update_project: FileEdit,
    send_notification: Mail,
    generate_report: FileEdit,
    create_milestone: Target,
    send_client_update: Mail,
    assign_project_manager: Target
  };

  // Quick start templates
  const projectTemplates = [
    {
      name: "Milestone Complete Notification",
      description: "Notify team and create follow-up when milestone is completed",
      workflow_type: "project",
      trigger_type: "milestone_completed",
      trigger_config: { to_status: "Completed" },
      steps: [
        { action_type: "send_notification", action_config: { message: "Milestone {{milestone_name}} completed!" } },
        { action_type: "create_task", action_config: { title: "Review milestone completion", task_type: "Follow-up Call", due_days: 2 } },
        { action_type: "update_project", action_config: { notes: "Milestone completed automatically" } }
      ]
    },
    {
      name: "Document Approved Flow",
      description: "Send client notification and log interaction when document approved",
      workflow_type: "project",
      trigger_type: "document_approved",
      trigger_config: { to_status: "approved" },
      steps: [
        { action_type: "send_client_update", action_config: { subject: "Document Approved", body: "Your document has been approved." } },
        { action_type: "create_task", action_config: { title: "Process approved document", task_type: "Other", due_days: 1 } }
      ]
    },
    {
      name: "Invoice Overdue Reminder",
      description: "Send reminder and create collection task when invoice overdue",
      workflow_type: "project",
      trigger_type: "invoice_overdue",
      trigger_config: { to_status: "overdue" },
      steps: [
        { action_type: "send_email", action_config: { subject: "Payment Reminder - Invoice Overdue", body: "Your invoice is overdue. Please remit payment at your earliest convenience." } },
        { action_type: "create_task", action_config: { title: "Follow up on overdue invoice", task_type: "Follow-up Call", priority: "High", due_days: 1 } },
        { action_type: "send_notification", action_config: { message: "Invoice overdue - collection task created" } }
      ]
    },
    {
      name: "Proposal Signed Onboarding",
      description: "Create onboarding milestone and notify team when proposal signed",
      workflow_type: "project",
      trigger_type: "proposal_signed",
      trigger_config: { to_status: "signed" },
      steps: [
        { action_type: "create_milestone", action_config: { milestone_name: "Client Onboarding", due_days: 7 } },
        { action_type: "send_notification", action_config: { message: "Proposal signed! Onboarding initiated." } },
        { action_type: "generate_report", action_config: { report_type: "project_progress" } }
      ]
    },
    {
      name: "New Client Onboarding",
      description: "Send welcome email, create tasks, and assign PM for new projects",
      workflow_type: "project",
      trigger_type: "project_created",
      trigger_config: {},
      steps: [
        { action_type: "send_email", action_config: { subject: "Welcome to Pacific Engineering!", body: "Thank you for choosing us. Your project manager will reach out shortly." } },
        { action_type: "create_task", action_config: { title: "Schedule kickoff meeting", task_type: "Schedule Meeting", priority: "High", due_days: 2 } },
        { action_type: "create_task", action_config: { title: "Send getting started guide", task_type: "Follow-up Email", due_days: 1 } },
        { action_type: "send_notification", action_config: { message: "New client onboarded - {{project_name}}" } }
      ]
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Workflow Automation</h1>
            <p className="text-lg text-gray-600">Create custom multi-step processes triggered by prospect events</p>
          </div>
          <Button
            onClick={startNewWorkflow}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Workflow
          </Button>
        </div>

        {/* CRM Workflow Templates */}
        <Card className="p-6 mb-4 border-0 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            CRM Quick Start Templates
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Qualified Lead Workflow",
                trigger: "Status → Qualified",
                actions: "Create follow-up task • Send proposal email • Update deal stage",
                template: {
                  name: "Qualified Lead Workflow",
                  description: "Auto-create tasks when lead qualifies",
                  workflow_type: "crm",
                  trigger_type: "status_change",
                  trigger_config: { to_status: "Qualified" },
                  steps: [
                    { action_type: "create_task", action_config: { title: "Follow up with qualified lead", task_type: "Follow-up Call", due_days: 1 } },
                    { action_type: "send_email", action_config: { subject: "Next Steps", body: "Thank you for your interest!" } }
                  ]
                }
              },
              {
                name: "Meeting Scheduled Prep",
                trigger: "Status → Meeting Scheduled",
                actions: "Create prep task • Wait 1 day • Send reminder email",
                template: {
                  name: "Meeting Scheduled Prep",
                  description: "Prepare for scheduled meetings",
                  workflow_type: "crm",
                  trigger_type: "status_change",
                  trigger_config: { to_status: "Meeting Scheduled" },
                  steps: [
                    { action_type: "create_task", action_config: { title: "Prepare meeting materials", task_type: "Research", due_days: 1 } }
                  ]
                }
              },
              {
                name: "Hot Lead Alert",
                trigger: "Engagement Score ≥ 70",
                actions: "Update segment • Create urgent task • Send notification",
                template: {
                  name: "Hot Lead Alert",
                  description: "Alert on high engagement scores",
                  workflow_type: "crm",
                  trigger_type: "score_threshold",
                  trigger_config: { score_field: "engagement_score", threshold: 70 },
                  steps: [
                    { action_type: "update_prospect", action_config: { field: "segment", value: "Hot Lead" } },
                    { action_type: "create_task", action_config: { title: "Contact hot lead immediately", task_type: "Follow-up Call", priority: "Urgent", due_days: 0 } }
                  ]
                }
              }
            ].map((template, idx) => (
              <Card 
                key={idx} 
                className="p-4 border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer bg-white"
                onClick={() => startNewWorkflow({ ...template.template, active: true, steps: template.template.steps })}
              >
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

        {/* Project Workflow Templates */}
        <Card className="p-6 mb-8 border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Project Workflow Templates
          </h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {projectTemplates.map((template, idx) => (
              <Card 
                key={idx} 
                className="p-4 border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer bg-white"
                onClick={() => startNewWorkflow({ ...template, active: true })}
              >
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">{template.name}</h4>
                <Badge className="mb-2 bg-blue-100 text-blue-700 text-xs">
                  {template.trigger_type.replace(/_/g, ' ')}
                </Badge>
                <p className="text-xs text-gray-600">
                  {template.steps.length} action{template.steps.length > 1 ? 's' : ''}
                </p>
              </Card>
            ))}
          </div>
        </Card>

        {/* AI Suggestions */}
        <AIWorkflowSuggestions
          projects={projects}
          workflows={workflows}
          onApplyTemplate={(template) => startNewWorkflow(template)}
        />

        {/* Visual Preview Modal */}
        {previewWorkflow && (
          <Card className="p-6 mb-4 border-0 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Visual Preview: {previewWorkflow.name}
              </h3>
              <Button variant="outline" size="sm" onClick={() => setPreviewWorkflow(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <VisualWorkflowCanvas workflow={previewWorkflow} />
          </Card>
        )}

        {/* Active Workflows */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-12 text-center border-0 shadow-xl">
              <p className="text-gray-600">Loading workflows...</p>
            </Card>
          ) : workflows.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-xl">
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
                <Card key={workflow.id} className="p-6 border-0 shadow-xl hover:shadow-2xl transition-all">
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
                      
                      {/* Trigger Display */}
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

                      {/* Steps Display */}
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
                        onClick={() => setPreviewWorkflow(previewWorkflow?.id === workflow.id ? null : workflow)}
                        title="Visual Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
    </div>
  );
}

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="p-8 border-0 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {workflow?.id ? "Edit Workflow" : "Create New Workflow"}
            </h2>
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Workflow Type</label>
                <Select 
                  value={formData.workflow_type || "crm"} 
                  onValueChange={(value) => setFormData({ ...formData, workflow_type: value, trigger_type: value === "crm" ? "status_change" : "project_created", trigger_config: {} })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crm">CRM (Prospects)</SelectItem>
                    <SelectItem value="project">Project-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            {/* Trigger Configuration */}
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
                      {(formData.workflow_type || "crm") === "crm" ? (
                        <>
                          <SelectItem value="status_change">Prospect Status Change</SelectItem>
                          <SelectItem value="date_based">Date/Time Based</SelectItem>
                          <SelectItem value="score_threshold">Score Threshold</SelectItem>
                          <SelectItem value="interaction_added">New Interaction</SelectItem>
                          <SelectItem value="task_completed">Task Completed</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="project_created">Project Created</SelectItem>
                          <SelectItem value="project_status_change">Project Status Change</SelectItem>
                          <SelectItem value="milestone_completed">Milestone Completed</SelectItem>
                          <SelectItem value="document_approved">Document Approved</SelectItem>
                          <SelectItem value="invoice_overdue">Invoice Overdue</SelectItem>
                          <SelectItem value="proposal_signed">Proposal Signed</SelectItem>
                          <SelectItem value="change_order_approved">Change Order Approved</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trigger-specific config */}
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

                {/* Project trigger configs */}
                {formData.trigger_type === "project_status_change" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">When Project Status Changes To</label>
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
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.trigger_type === "milestone_completed" && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <strong>Trigger:</strong> When any milestone status changes to "Completed"
                  </div>
                )}

                {formData.trigger_type === "document_approved" && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <strong>Trigger:</strong> When a document status changes to "approved"
                  </div>
                )}

                {formData.trigger_type === "invoice_overdue" && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <strong>Trigger:</strong> When an invoice status changes to "overdue"
                  </div>
                )}

                {formData.trigger_type === "proposal_signed" && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <strong>Trigger:</strong> When a proposal status changes to "signed"
                  </div>
                )}

                {formData.trigger_type === "change_order_approved" && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <strong>Trigger:</strong> When a change order status changes to "Approved"
                  </div>
                )}

                {formData.trigger_type === "project_created" && (
                  <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                    <strong>Trigger:</strong> Fires automatically when a new project is created
                  </div>
                )}
              </div>
            </div>

            {/* Steps Configuration */}
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
                  <Card className="p-8 text-center bg-gray-50">
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

            {/* Save Buttons */}
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
                  <>Saving...</>
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
      </div>
    </div>
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
              <SelectItem value="send_notification">Send Notification</SelectItem>
              <SelectItem value="update_prospect">Update Prospect Field</SelectItem>
              <SelectItem value="update_project">Update Project</SelectItem>
              <SelectItem value="create_milestone">Create Milestone</SelectItem>
              <SelectItem value="send_client_update">Send Client Update</SelectItem>
              <SelectItem value="generate_report">Generate Report</SelectItem>
              <SelectItem value="assign_project_manager">Assign Project Manager</SelectItem>
              <SelectItem value="wait_days">Wait (Days)</SelectItem>
              <SelectItem value="create_interaction">Log Interaction</SelectItem>
            </SelectContent>
          </Select>

          {/* Action-specific configs */}
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

          {step.action_type === "send_notification" && (
            <div className="space-y-2">
              <Input
                placeholder="Notification message (use {{project_name}}, {{client_name}} for variables)"
                value={step.action_config?.message || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, message: e.target.value }
                })}
              />
              <Select
                value={step.action_config?.priority || "normal"}
                onValueChange={(value) => onChange({
                  action_config: { ...step.action_config, priority: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step.action_type === "update_project" && (
            <div className="space-y-2">
              <Select
                value={step.action_config?.status}
                onValueChange={(value) => onChange({
                  action_config: { ...step.action_config, status: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="New project status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Notes to add (optional)"
                value={step.action_config?.notes || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, notes: e.target.value }
                })}
              />
            </div>
          )}

          {step.action_type === "create_milestone" && (
            <div className="space-y-2">
              <Input
                placeholder="Milestone name"
                value={step.action_config?.milestone_name || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, milestone_name: e.target.value }
                })}
              />
              <Input
                type="number"
                placeholder="Due in days (default: 14)"
                value={step.action_config?.due_days || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, due_days: parseInt(e.target.value) }
                })}
              />
            </div>
          )}

          {step.action_type === "send_client_update" && (
            <div className="space-y-2">
              <Input
                placeholder="Email subject"
                value={step.action_config?.subject || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, subject: e.target.value }
                })}
              />
              <Textarea
                placeholder="Email body (use {{project_name}}, {{client_name}} for variables)"
                value={step.action_config?.body || ""}
                onChange={(e) => onChange({
                  action_config: { ...step.action_config, body: e.target.value }
                })}
                rows={3}
              />
            </div>
          )}

          {step.action_type === "generate_report" && (
            <Select
              value={step.action_config?.report_type || "project_progress"}
              onValueChange={(value) => onChange({
                action_config: { ...step.action_config, report_type: value }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project_progress">Project Progress</SelectItem>
                <SelectItem value="budget_status">Budget Status</SelectItem>
                <SelectItem value="communications_summary">Communications Summary</SelectItem>
                <SelectItem value="full_project_report">Full Project Report</SelectItem>
              </SelectContent>
            </Select>
          )}

          {step.action_type === "assign_project_manager" && (
            <Input
              placeholder="PM email address"
              value={step.action_config?.pm_email || ""}
              onChange={(e) => onChange({
                action_config: { ...step.action_config, pm_email: e.target.value }
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