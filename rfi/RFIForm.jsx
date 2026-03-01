import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RFITemplatePicker from "./RFITemplatePicker";

export default function RFIForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = React.useState(() => ({
    project_id: initial?.project_id || "",
    project_name: initial?.project_name || "",
    client_email: initial?.client_email || "",
    rfi_number: initial?.rfi_number || "",
    title: initial?.title || "",
    subject_area: initial?.subject_area || "",
    spec_section: initial?.spec_section || "",
    drawing_no: initial?.drawing_no || "",
    detail_no: initial?.detail_no || "",
    note_no: initial?.note_no || "",
    question: initial?.question || "",
    cost_impact: initial?.cost_impact || "none",
    cost_amount: initial?.cost_amount || 0,
    schedule_impact: initial?.schedule_impact || "none",
    schedule_days: initial?.schedule_days || 0,
    due_date: initial?.due_date || "",
    template_name: initial?.template_name || "Classic Minimal",
  }));

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initial ? "Edit RFI" : "Create RFI"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Project ID" value={form.project_id} onChange={(e)=>change('project_id', e.target.value)} />
            <Input placeholder="Project Name" value={form.project_name} onChange={(e)=>change('project_name', e.target.value)} />
            <Input placeholder="Client Email" value={form.client_email} onChange={(e)=>change('client_email', e.target.value)} />
            <Input placeholder="RFI Number" value={form.rfi_number} onChange={(e)=>change('rfi_number', e.target.value)} />
            <Input placeholder="Subject Area" value={form.subject_area} onChange={(e)=>change('subject_area', e.target.value)} />
            <Input placeholder="Spec Section" value={form.spec_section} onChange={(e)=>change('spec_section', e.target.value)} />
            <Input placeholder="Drawing #" value={form.drawing_no} onChange={(e)=>change('drawing_no', e.target.value)} />
            <Input placeholder="Detail #" value={form.detail_no} onChange={(e)=>change('detail_no', e.target.value)} />
            <Input placeholder="Note #" value={form.note_no} onChange={(e)=>change('note_no', e.target.value)} />
            <Input type="date" placeholder="Due Date" value={form.due_date} onChange={(e)=>change('due_date', e.target.value)} />
          </div>

          <Textarea placeholder="Request / Clarification required" value={form.question} onChange={(e)=>change('question', e.target.value)} className="min-h-28" />

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cost Impact</label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={form.cost_impact==='none'? 'default':'outline'} onClick={()=>change('cost_impact','none')}>None</Button>
                <Button type="button" variant={form.cost_impact==='increase'? 'default':'outline'} onClick={()=>change('cost_impact','increase')}>Increase</Button>
                <Button type="button" variant={form.cost_impact==='decrease'? 'default':'outline'} onClick={()=>change('cost_impact','decrease')}>Decrease</Button>
                <Button type="button" variant={form.cost_impact==='tbd'? 'default':'outline'} onClick={()=>change('cost_impact','tbd')}>TBD</Button>
              </div>
              {(form.cost_impact==='increase' || form.cost_impact==='decrease') && (
                <Input type="number" placeholder="Amount ($)" value={form.cost_amount} onChange={(e)=>change('cost_amount', Number(e.target.value))} />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule Impact</label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={form.schedule_impact==='none'? 'default':'outline'} onClick={()=>change('schedule_impact','none')}>None</Button>
                <Button type="button" variant={form.schedule_impact==='increase_days'? 'default':'outline'} onClick={()=>change('schedule_impact','increase_days')}>Increase (days)</Button>
                <Button type="button" variant={form.schedule_impact==='decrease_days'? 'default':'outline'} onClick={()=>change('schedule_impact','decrease_days')}>Decrease (days)</Button>
                <Button type="button" variant={form.schedule_impact==='tbd'? 'default':'outline'} onClick={()=>change('schedule_impact','tbd')}>TBD</Button>
              </div>
              {(form.schedule_impact==='increase_days' || form.schedule_impact==='decrease_days') && (
                <Input type="number" placeholder="Days" value={form.schedule_days} onChange={(e)=>change('schedule_days', Number(e.target.value))} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Template</label>
            <RFITemplatePicker value={form.template_name} onChange={(v)=>change('template_name', v)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{initial? 'Update RFI' : 'Create RFI'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}