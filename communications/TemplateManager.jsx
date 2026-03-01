import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Plus, Edit, Trash2, Loader2, CheckCircle, Eye } from "lucide-react";
import { toast } from "sonner";

export default function TemplateManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const queryClient = useQueryClient();

  const [newTemplate, setNewTemplate] = useState({
    template_name: "",
    template_type: "project_update",
    subject_template: "",
    body_template: "",
    trigger_event: "manual",
    trigger_days_before: 3,
    active: true,
    variables: ["project_name", "client_name", "date"]
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['communication-templates'],
    queryFn: async () => {
      try {
        return await base44.entities.CommunicationTemplate.list('-created_date', 100);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load templates");
        return [];
      }
    },
    initialData: []
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData) => {
      return await base44.entities.CommunicationTemplate.create(templateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-templates'] });
      setShowCreateDialog(false);
      setNewTemplate({
        template_name: "",
        template_type: "project_update",
        subject_template: "",
        body_template: "",
        trigger_event: "manual",
        trigger_days_before: 3,
        active: true,
        variables: ["project_name", "client_name", "date"]
      });
      toast.success("Template created successfully");
    },
    onError: (error) => {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.CommunicationTemplate.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-templates'] });
      setEditingTemplate(null);
      toast.success("Template updated successfully");
    },
    onError: (error) => {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.CommunicationTemplate.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-templates'] });
      toast.success("Template deleted");
    },
    onError: (error) => {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  });

  const previewWithSampleData = (template) => {
    const sampleData = {
      project_name: "Sample Construction Project",
      client_name: "John Doe",
      company_name: "ABC Construction",
      date: new Date().toLocaleDateString(),
      milestone_name: "Foundation Complete",
      task_name: "Review Documents",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    let subject = template.subject_template;
    let body = template.body_template;

    Object.keys(sampleData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, sampleData[key]);
      body = body.replace(regex, sampleData[key]);
    });

    return { subject, body };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Templates</h2>
          <p className="text-gray-600">Manage email templates for automated client communications</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-lg">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No templates yet. Create your first template!</p>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{template.template_name}</h3>
                    <Badge variant={template.active ? "default" : "outline"}>
                      {template.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{template.template_type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {template.subject_template}
                  </p>
                  <p className="text-xs text-gray-500">
                    Trigger: {template.trigger_event}
                    {template.trigger_days_before && ` (${template.trigger_days_before} days before)`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Delete template "${template.template_name}"?`)) {
                        deleteTemplateMutation.mutate(template.id);
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingTemplate(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              Use variables like {'{{project_name}}'}, {'{{client_name}}'}, {'{{date}}'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={editingTemplate ? editingTemplate.template_name : newTemplate.template_name}
                onChange={(e) => {
                  if (editingTemplate) {
                    setEditingTemplate({ ...editingTemplate, template_name: e.target.value });
                  } else {
                    setNewTemplate({ ...newTemplate, template_name: e.target.value });
                  }
                }}
                placeholder="Project Update Template"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Type</label>
                <Select
                  value={editingTemplate ? editingTemplate.template_type : newTemplate.template_type}
                  onValueChange={(value) => {
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, template_type: value });
                    } else {
                      setNewTemplate({ ...newTemplate, template_type: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project_update">Project Update</SelectItem>
                    <SelectItem value="milestone_complete">Milestone Complete</SelectItem>
                    <SelectItem value="task_assigned">Task Assigned</SelectItem>
                    <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                    <SelectItem value="status_report">Status Report</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trigger Event</label>
                <Select
                  value={editingTemplate ? editingTemplate.trigger_event : newTemplate.trigger_event}
                  onValueChange={(value) => {
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, trigger_event: value });
                    } else {
                      setNewTemplate({ ...newTemplate, trigger_event: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milestone_completed">Milestone Completed</SelectItem>
                    <SelectItem value="task_assigned">Task Assigned</SelectItem>
                    <SelectItem value="status_changed">Status Changed</SelectItem>
                    <SelectItem value="deadline_approaching">Deadline Approaching</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Subject</label>
              <Input
                value={editingTemplate ? editingTemplate.subject_template : newTemplate.subject_template}
                onChange={(e) => {
                  if (editingTemplate) {
                    setEditingTemplate({ ...editingTemplate, subject_template: e.target.value });
                  } else {
                    setNewTemplate({ ...newTemplate, subject_template: e.target.value });
                  }
                }}
                placeholder="Project Update: {{project_name}}"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Body (HTML)</label>
              <Textarea
                value={editingTemplate ? editingTemplate.body_template : newTemplate.body_template}
                onChange={(e) => {
                  if (editingTemplate) {
                    setEditingTemplate({ ...editingTemplate, body_template: e.target.value });
                  } else {
                    setNewTemplate({ ...newTemplate, body_template: e.target.value });
                  }
                }}
                placeholder="Hi {{client_name}},&#10;&#10;Your project {{project_name}} has been updated..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingTemplate(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingTemplate) {
                    updateTemplateMutation.mutate({
                      id: editingTemplate.id,
                      data: editingTemplate
                    });
                  } else {
                    createTemplateMutation.mutate(newTemplate);
                  }
                }}
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {editingTemplate ? "Update" : "Create"} Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.template_name}</DialogTitle>
            <DialogDescription>Sample data preview</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Subject:</p>
                <p className="text-gray-900">{previewWithSampleData(previewTemplate).subject}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Body:</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewWithSampleData(previewTemplate).body }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}