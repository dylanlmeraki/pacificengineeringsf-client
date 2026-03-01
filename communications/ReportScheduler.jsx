import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Calendar, Clock, Plus, Loader2, Play, Pause, Trash2, Eye, FileText, Send
} from "lucide-react";
import { toast } from "sonner";
import { generateProjectReport } from "@/functions/generateProjectReport";

const SECTION_OPTIONS = [
  { value: "progress", label: "Project Progress" },
  { value: "milestones", label: "Milestones" },
  { value: "budget", label: "Budget & Financials" },
  { value: "change_orders", label: "Change Orders" },
  { value: "documents", label: "Documents" },
  { value: "messages", label: "Communications" },
  { value: "invoices", label: "Invoices" },
  { value: "risks", label: "Risks & Alerts" },
];

const FREQUENCY_LABELS = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  one_time: "One-Time",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ReportScheduler({ projects = [], clients = [], selectedClient, selectedProject }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);

  const [form, setForm] = useState({
    report_name: "",
    report_type: "full_project_report",
    frequency: "weekly",
    day_of_week: 1,
    day_of_month: 1,
    time_of_day: "09:00",
    project_ids: [],
    client_email: selectedClient || "",
    client_name: "",
    recipient_emails: [],
    include_sections: ["progress", "milestones", "budget"],
    custom_intro: "",
    active: true,
  });
  const [recipientInput, setRecipientInput] = useState("");

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["scheduled-reports"],
    queryFn: () => base44.entities.ScheduledReport.list("-created_date", 100),
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.ScheduledReport.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-reports"] });
      setShowCreate(false);
      resetForm();
      toast.success("Report schedule created");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.ScheduledReport.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-reports"] });
      toast.success("Schedule deleted");
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }) => base44.entities.ScheduledReport.update(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-reports"] }),
  });

  function resetForm() {
    setForm({
      report_name: "", report_type: "full_project_report", frequency: "weekly",
      day_of_week: 1, day_of_month: 1, time_of_day: "09:00",
      project_ids: [], client_email: selectedClient || "", client_name: "",
      recipient_emails: [], include_sections: ["progress", "milestones", "budget"],
      custom_intro: "", active: true,
    });
    setRecipientInput("");
  }

  function addRecipient() {
    const email = recipientInput.trim();
    if (email && !form.recipient_emails.includes(email)) {
      setForm(f => ({ ...f, recipient_emails: [...f.recipient_emails, email] }));
    }
    setRecipientInput("");
  }

  async function generateNow(schedule) {
    setGeneratingId(schedule.id);
    try {
      const { data } = await generateProjectReport({
        schedule_id: schedule.id,
        project_ids: schedule.project_ids,
        client_email: schedule.client_email,
        include_sections: schedule.include_sections,
        custom_intro: schedule.custom_intro,
        send_email: [],
      });
      if (data?.report_html) {
        setPreviewHtml(data.report_html);
        qc.invalidateQueries({ queryKey: ["scheduled-reports"] });
        toast.success("Report generated");
      }
    } catch (e) {
      toast.error("Failed to generate report");
    } finally {
      setGeneratingId(null);
    }
  }

  async function generateAndSend(schedule) {
    setGeneratingId(schedule.id);
    try {
      await generateProjectReport({
        schedule_id: schedule.id,
        project_ids: schedule.project_ids,
        client_email: schedule.client_email,
        include_sections: schedule.include_sections,
        custom_intro: schedule.custom_intro,
        send_email: schedule.recipient_emails,
      });
      qc.invalidateQueries({ queryKey: ["scheduled-reports"] });
      toast.success("Report generated & emailed");
    } catch (e) {
      toast.error("Failed to generate/send report");
    } finally {
      setGeneratingId(null);
    }
  }

  const toggleSection = (val) => {
    setForm(f => ({
      ...f,
      include_sections: f.include_sections.includes(val)
        ? f.include_sections.filter(s => s !== val)
        : [...f.include_sections, val],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scheduled Reports</h2>
          <p className="text-gray-600">Automated project & client reports on your schedule</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Schedule
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : schedules.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No scheduled reports yet. Create one to automate your reporting.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedules.map(s => (
            <Card key={s.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{s.report_name}</h3>
                      <Badge variant={s.active ? "default" : "outline"}>{s.active ? "Active" : "Paused"}</Badge>
                      <Badge variant="outline">{FREQUENCY_LABELS[s.frequency]}</Badge>
                      <Badge variant="secondary">{s.report_type?.replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-x-3">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {s.time_of_day || '09:00'}</span>
                      {s.frequency === 'weekly' && <span>Every {DAY_LABELS[s.day_of_week ?? 1]}</span>}
                      {s.frequency === 'monthly' && <span>Day {s.day_of_month ?? 1}</span>}
                      <span>→ {s.recipient_emails?.join(', ')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(s.include_sections || []).map(sec => (
                        <Badge key={sec} variant="outline" className="text-xs">{sec}</Badge>
                      ))}
                    </div>
                    {s.last_generated_at && (
                      <p className="text-xs text-gray-500 mt-2">Last generated: {new Date(s.last_generated_at).toLocaleString()} ({s.generation_count || 0} total)</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => generateNow(s)} disabled={generatingId === s.id}>
                      {generatingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => generateAndSend(s)} disabled={generatingId === s.id}>
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleMut.mutate({ id: s.id, active: !s.active })}>
                      {s.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    {s.last_report_html && (
                      <Button size="sm" variant="ghost" onClick={() => setPreviewHtml(s.last_report_html)}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => { if (confirm('Delete this schedule?')) deleteMut.mutate(s.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={o => { if (!o) { setShowCreate(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Report Schedule</DialogTitle>
            <DialogDescription>Configure what data to include, who receives it, and how often.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Report Name</Label>
                <Input value={form.report_name} onChange={e => setForm(f => ({ ...f, report_name: e.target.value }))} placeholder="Weekly Client Update" />
              </div>
              <div className="space-y-1.5">
                <Label>Report Type</Label>
                <Select value={form.report_type} onValueChange={v => setForm(f => ({ ...f, report_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project_progress">Project Progress</SelectItem>
                    <SelectItem value="budget_status">Budget Status</SelectItem>
                    <SelectItem value="communications_summary">Communications Summary</SelectItem>
                    <SelectItem value="full_project_report">Full Project Report</SelectItem>
                    <SelectItem value="client_portfolio">Client Portfolio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQUENCY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {['weekly', 'biweekly'].includes(form.frequency) && (
                <div className="space-y-1.5">
                  <Label>Day of Week</Label>
                  <Select value={String(form.day_of_week)} onValueChange={v => setForm(f => ({ ...f, day_of_week: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAY_LABELS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {['monthly', 'quarterly'].includes(form.frequency) && (
                <div className="space-y-1.5">
                  <Label>Day of Month</Label>
                  <Input type="number" min={1} max={28} value={form.day_of_month} onChange={e => setForm(f => ({ ...f, day_of_month: Number(e.target.value) }))} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Time</Label>
                <Input type="time" value={form.time_of_day} onChange={e => setForm(f => ({ ...f, time_of_day: e.target.value }))} />
              </div>
            </div>

            {/* Scope */}
            <div className="space-y-1.5">
              <Label>Client Scope</Label>
              <Select value={form.client_email} onValueChange={v => {
                const cl = clients.find(c => c.email === v);
                setForm(f => ({ ...f, client_email: v, client_name: cl?.name || v }));
              }}>
                <SelectTrigger><SelectValue placeholder="All clients (leave empty)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Clients</SelectItem>
                  {clients.map(c => <SelectItem key={c.email} value={c.email}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {projects.length > 0 && (
              <div className="space-y-1.5">
                <Label>Projects (leave empty for all client projects)</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {projects.map(p => (
                    <label key={p.id} className="flex items-center gap-1.5 text-sm bg-gray-50 rounded px-2 py-1 cursor-pointer hover:bg-gray-100">
                      <Checkbox
                        checked={form.project_ids.includes(p.id)}
                        onCheckedChange={checked => setForm(f => ({
                          ...f,
                          project_ids: checked ? [...f.project_ids, p.id] : f.project_ids.filter(id => id !== p.id)
                        }))}
                      />
                      {p.project_name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-1.5">
              <Label>Report Sections</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {SECTION_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm bg-gray-50 rounded px-3 py-2 cursor-pointer hover:bg-gray-100">
                    <Checkbox
                      checked={form.include_sections.includes(opt.value)}
                      onCheckedChange={() => toggleSection(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-1.5">
              <Label>Recipients</Label>
              <div className="flex gap-2">
                <Input value={recipientInput} onChange={e => setRecipientInput(e.target.value)} placeholder="email@example.com"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(); } }} />
                <Button type="button" variant="outline" onClick={addRecipient}>Add</Button>
              </div>
              {form.recipient_emails.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.recipient_emails.map(e => (
                    <Badge key={e} variant="secondary" className="cursor-pointer" onClick={() => setForm(f => ({ ...f, recipient_emails: f.recipient_emails.filter(x => x !== e) }))}>
                      {e} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Custom Introduction (optional)</Label>
              <Textarea value={form.custom_intro} onChange={e => setForm(f => ({ ...f, custom_intro: e.target.value }))} placeholder="Add a personalized intro to the report..." rows={2} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createMut.isPending || !form.report_name || form.recipient_emails.length === 0 || form.include_sections.length === 0}
                onClick={() => createMut.mutate(form)}
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                Create Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewHtml} onOpenChange={() => setPreviewHtml(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml || '' }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}