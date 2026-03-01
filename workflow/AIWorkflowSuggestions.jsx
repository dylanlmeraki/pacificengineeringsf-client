import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Plus, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIWorkflowSuggestions({ projects = [], workflows = [], onApplyTemplate }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const generateSuggestions = async () => {
    setLoading(true);
    const context = {
      total_projects: projects.length,
      project_types: projects.reduce((acc, p) => { acc[p.project_type || "Other"] = (acc[p.project_type || "Other"] || 0) + 1; return acc; }, {}),
      statuses: projects.reduce((acc, p) => { acc[p.status || "Unknown"] = (acc[p.status || "Unknown"] || 0) + 1; return acc; }, {}),
      existing_workflows: workflows.map((w) => ({ name: w.name, trigger: w.trigger_type, type: w.workflow_type })),
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a construction project automation expert. Based on this context, suggest 3-5 workflow automations that would benefit this organization. For each suggestion, provide:
- name: workflow name
- description: what it does and why it's useful
- trigger_type: one of (status_change, date_based, score_threshold, interaction_added, task_completed, milestone_completed, document_approved, invoice_overdue, proposal_signed, project_status_change, change_order_approved, project_created)
- workflow_type: "crm" or "project"
- steps: array of { action_type, action_config } where action_type is one of (create_task, send_email, send_notification, update_prospect, update_project, create_milestone, send_client_update, generate_report, assign_project_manager, wait_days, create_interaction)

Context: ${JSON.stringify(context)}

Return JSON array of suggestions. Focus on automations that don't already exist.`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                trigger_type: { type: "string" },
                workflow_type: { type: "string" },
                steps: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
    });

    setSuggestions(res?.suggestions || []);
    setLoading(false);
  };

  return (
    <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Workflow Suggestions
        </h3>
        <Button onClick={generateSuggestions} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {loading ? "Analyzing..." : "Get Suggestions"}
        </Button>
      </div>

      {suggestions.length === 0 && !loading && (
        <div className="text-sm text-gray-500 text-center py-6 bg-white rounded-lg border">
          Click "Get Suggestions" for AI-recommended automations based on your portfolio
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((s, idx) => (
            <div key={idx} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-gray-900">{s.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {s.workflow_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{s.description}</p>
                  <div className="flex gap-1 flex-wrap">
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      {(s.trigger_type || "").replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {(s.steps || []).length} steps
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0"
                  onClick={() =>
                    onApplyTemplate({
                      name: s.name,
                      description: s.description,
                      trigger_type: s.trigger_type,
                      workflow_type: s.workflow_type || "project",
                      trigger_config: {},
                      steps: s.steps || [],
                      active: true,
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}