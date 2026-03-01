import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, Zap } from "lucide-react";

export default function WorkflowRuleBuilder({ rule = null, onSave, onCancel }) {
  const [formData, setFormData] = useState(rule || {
    rule_name: "",
    rule_type: "task_assignment",
    trigger_event: "proposal_created",
    conditions: {},
    actions: [],
    priority: 100,
    active: true,
    conflict_resolution: "manual"
  });
  
  const queryClient = useQueryClient();
  
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (rule?.id) {
        return await base44.entities.WorkflowRule.update(rule.id, data);
      } else {
        return await base44.entities.WorkflowRule.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
      if (onSave) onSave();
    }
  });
  
  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, {
        action_type: "assign_task",
        target_role: "",
        priority: "medium"
      }]
    });
  };
  
  const removeAction = (idx) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== idx)
    });
  };
  
  const updateAction = (idx, field, value) => {
    const newActions = [...formData.actions];
    newActions[idx][field] = value;
    setFormData({ ...formData, actions: newActions });
  };
  
  const handleSubmit = () => {
    saveMutation.mutate(formData);
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rule Name *</label>
            <Input
              value={formData.rule_name}
              onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
              placeholder="Auto-assign SWPPP proposals to estimators"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rule Type *</label>
              <Select
                value={formData.rule_type}
                onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task_assignment">Task Assignment</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="status_transition">Status Transition</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="escalation">Escalation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trigger Event *</label>
              <Select
                value={formData.trigger_event}
                onValueChange={(value) => setFormData({ ...formData, trigger_event: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposal_created">Proposal Created</SelectItem>
                  <SelectItem value="proposal_status_change">Proposal Status Change</SelectItem>
                  <SelectItem value="project_created">Project Created</SelectItem>
                  <SelectItem value="project_status_change">Project Status Change</SelectItem>
                  <SelectItem value="milestone_due">Milestone Due</SelectItem>
                  <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                  <SelectItem value="approval_pending">Approval Pending</SelectItem>
                  <SelectItem value="task_overdue">Task Overdue</SelectItem>
                  <SelectItem value="lead_aged">Lead Aged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">Higher priority = executes first</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Conflict Resolution</label>
              <Select
                value={formData.conflict_resolution}
                onValueChange={(value) => setFormData({ ...formData, conflict_resolution: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skip">Skip</SelectItem>
                  <SelectItem value="override">Override</SelectItem>
                  <SelectItem value="manual">Manual Review</SelectItem>
                  <SelectItem value="merge">Merge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded"
              />
              Rule Active
            </label>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Actions</h3>
          <Button onClick={addAction} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.actions.map((action, idx) => (
            <Card key={idx} className="p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <Select
                    value={action.action_type}
                    onValueChange={(value) => updateAction(idx, 'action_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Action Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign_task">Assign Task</SelectItem>
                      <SelectItem value="send_notification">Send Notification</SelectItem>
                      <SelectItem value="update_status">Update Status</SelectItem>
                      <SelectItem value="create_task">Create Task</SelectItem>
                      <SelectItem value="send_email">Send Email</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    value={action.target_role || ""}
                    onChange={(e) => updateAction(idx, 'target_role', e.target.value)}
                    placeholder="Target Role (e.g., estimator, project_manager)"
                  />
                  
                  <Select
                    value={action.priority}
                    onValueChange={(value) => updateAction(idx, 'priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAction(idx)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
          
          {formData.actions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No actions defined yet</p>
            </div>
          )}
        </div>
      </Card>
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.rule_name || formData.actions.length === 0 || saveMutation.isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {rule ? 'Update' : 'Create'} Rule
        </Button>
      </div>
    </div>
  );
}