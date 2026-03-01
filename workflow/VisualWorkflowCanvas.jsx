import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  ArrowDown,
  CheckSquare,
  Mail,
  Clock,
  MessageSquare,
  FileEdit,
  Target,
  AlertCircle,
  GitBranch
} from "lucide-react";

const ACTION_ICONS = {
  create_task: CheckSquare,
  send_email: Mail,
  send_notification: Mail,
  update_prospect: FileEdit,
  update_project: FileEdit,
  create_milestone: Target,
  send_client_update: Mail,
  generate_report: FileEdit,
  assign_project_manager: Target,
  wait_days: Clock,
  create_interaction: MessageSquare,
};

const TRIGGER_LABELS = {
  status_change: "Status Change",
  date_based: "Date Reached",
  score_threshold: "Score Threshold",
  interaction_added: "New Interaction",
  task_completed: "Task Completed",
  milestone_completed: "Milestone Complete",
  document_approved: "Document Approved",
  invoice_overdue: "Invoice Overdue",
  proposal_signed: "Proposal Signed",
  project_status_change: "Project Status Change",
  change_order_approved: "Change Order Approved",
  project_created: "Project Created",
};

export default function VisualWorkflowCanvas({ workflow }) {
  if (!workflow) return null;

  const triggerLabel = TRIGGER_LABELS[workflow.trigger_type] || workflow.trigger_type;
  const configSummary = workflow.trigger_config?.to_status
    ? `→ ${workflow.trigger_config.to_status}`
    : workflow.trigger_config?.threshold
    ? `≥ ${workflow.trigger_config.threshold}`
    : "";

  return (
    <div className="flex flex-col items-center gap-0 py-4">
      {/* Trigger Node */}
      <div className="relative">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-4 shadow-lg min-w-[220px] text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="w-4 h-4" />
            <span className="font-semibold text-sm">TRIGGER</span>
          </div>
          <div className="text-xs opacity-90">{triggerLabel}</div>
          {configSummary && <div className="text-xs mt-1 font-medium">{configSummary}</div>}
        </div>
      </div>

      {/* Steps */}
      {(workflow.steps || []).map((step, idx) => {
        const Icon = ACTION_ICONS[step.action_type] || Zap;
        const isWait = step.action_type === "wait_days";
        return (
          <React.Fragment key={idx}>
            {/* Connector */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-gray-300" />
              <ArrowDown className="w-4 h-4 text-gray-400 -my-0.5" />
              <div className="w-0.5 h-2 bg-gray-300" />
            </div>

            {/* Action Node */}
            <div
              className={`rounded-xl p-4 shadow-md min-w-[220px] text-center border-2 ${
                isWait
                  ? "bg-amber-50 border-amber-300"
                  : "bg-white border-blue-200 hover:border-blue-400"
              } transition-colors`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className={`p-1.5 rounded-md ${isWait ? "bg-amber-100" : "bg-blue-100"}`}>
                  <Icon className={`w-3.5 h-3.5 ${isWait ? "text-amber-700" : "text-blue-700"}`} />
                </div>
                <Badge variant="outline" className="text-xs">
                  Step {idx + 1}
                </Badge>
              </div>
              <div className="text-sm font-medium text-gray-800">
                {step.action_type.replace(/_/g, " ")}
              </div>
              {step.action_config?.title && (
                <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px] mx-auto">
                  {step.action_config.title}
                </div>
              )}
              {step.action_config?.subject && (
                <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px] mx-auto">
                  {step.action_config.subject}
                </div>
              )}
              {isWait && step.action_config?.days && (
                <div className="text-xs text-amber-700 mt-1 font-medium">
                  Wait {step.action_config.days} day{step.action_config.days > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* End node */}
      {(workflow.steps || []).length > 0 && (
        <>
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gray-300" />
            <ArrowDown className="w-4 h-4 text-gray-400 -my-0.5" />
            <div className="w-0.5 h-2 bg-gray-300" />
          </div>
          <div className="bg-green-100 text-green-700 rounded-full px-6 py-2 text-xs font-semibold border border-green-300">
            ✓ WORKFLOW COMPLETE
          </div>
        </>
      )}
    </div>
  );
}