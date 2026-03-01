import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { BookTemplate, Loader2, Check } from "lucide-react";

const CATEGORY_COLORS = {
  project_update: "bg-blue-100 text-blue-700",
  milestone_complete: "bg-green-100 text-green-700",
  deadline_reminder: "bg-orange-100 text-orange-700",
  invoice: "bg-purple-100 text-purple-700",
  welcome: "bg-cyan-100 text-cyan-700",
  status_report: "bg-indigo-100 text-indigo-700",
  task_assigned: "bg-yellow-100 text-yellow-700",
  proposal: "bg-pink-100 text-pink-700",
  custom: "bg-gray-100 text-gray-700",
};

/**
 * MessageTemplatePicker
 * Props:
 *   onSelect(messageText: string) – called with the interpolated template body as plain text
 *   projectName – for variable interpolation
 *   clientName – for variable interpolation
 */
export default function MessageTemplatePicker({ onSelect, projectName = "", clientName = "" }) {
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["communication-templates"],
    queryFn: () => base44.entities.CommunicationTemplate.list("-created_date", 200),
    initialData: [],
  });

  const activeTemplates = templates.filter(t => t.active !== false);
  const filtered = filterType === "all" ? activeTemplates : activeTemplates.filter(t => t.template_type === filterType);

  function interpolate(text) {
    if (!text) return "";
    return text
      .replace(/\{\{project_name\}\}/g, projectName || "{{project_name}}")
      .replace(/\{\{client_name\}\}/g, clientName || "{{client_name}}")
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{deadline\}\}/g, "")
      .replace(/\{\{milestone_name\}\}/g, "")
      .replace(/\{\{progress\}\}/g, "")
      // strip basic HTML tags to produce plain text for message thread
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  function handlePick(template) {
    const text = interpolate(template.body_template);
    onSelect(text);
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <BookTemplate className="w-4 h-4" /> Templates
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Templates</DialogTitle>
            <DialogDescription>Pick a template to insert into your message</DialogDescription>
          </DialogHeader>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="mb-3"><SelectValue placeholder="Filter by type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="project_update">Project Update</SelectItem>
              <SelectItem value="milestone_complete">Milestone Complete</SelectItem>
              <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="status_report">Status Report</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">No templates found. Create templates in Communications → Templates.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onClick={() => handlePick(t)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">{t.template_name}</span>
                    <Badge className={CATEGORY_COLORS[t.template_type] || "bg-gray-100 text-gray-700"}>
                      {t.template_type?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{interpolate(t.body_template)?.substring(0, 120)}...</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition">
                    <Check className="w-3 h-3" /> Click to use
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}