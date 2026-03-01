import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { BuilderField } from "./FieldList";

export default function FieldSettings({ field, onChange }: { field?: BuilderField; onChange: (f: BuilderField)=>void }){
  if (!field) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Field Settings</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-500">Select a field to edit its settings.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Field Settings</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs text-slate-500">Key</label>
          <Input value={field.key} onChange={(e)=> onChange({ ...field, key: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Label</label>
          <Input value={field.label} onChange={(e)=> onChange({ ...field, label: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Kind</label>
          <Select value={field.kind} onValueChange={(v)=> onChange({ ...field, kind: v as any })}>
            <SelectTrigger><SelectValue placeholder="Select kind"/></SelectTrigger>
            <SelectContent>
              {['text','textarea','number','date','dropdown','checkbox','radio','multiselect','boolean'].map(k=> (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Placeholder</label>
          <Input value={field.placeholder || ''} onChange={(e)=> onChange({ ...field, placeholder: e.target.value })} />
        </div>
        <div className="flex items-center justify-between py-1">
          <div className="text-sm">Required</div>
          <Switch checked={!!field.required} onCheckedChange={(v)=> onChange({ ...field, required: !!v })} />
        </div>
        {['dropdown','radio','multiselect'].includes(field.kind) && (
          <div>
            <label className="text-xs text-slate-500">Options (comma separated)</label>
            <Textarea value={(field.options||[]).join(', ')} onChange={(e)=> onChange({ ...field, options: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
          </div>
        )}
        <div>
          <label className="text-xs text-slate-500">Default Value</label>
          <Input value={field.default_value ?? ''} onChange={(e)=> onChange({ ...field, default_value: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Mapping (optional)</label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={field.mapping?.source || ''} onValueChange={(v)=> onChange({ ...field, mapping: { ...(field.mapping||{}), source: v as any } })}>
              <SelectTrigger><SelectValue placeholder="Source"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="ProjectDoc">ProjectDoc</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="path e.g. project_name" value={field.mapping?.path || ''} onChange={(e)=> onChange({ ...field, mapping: { ...(field.mapping||{}), path: e.target.value } })} />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500">Conditionals (JSON)</label>
          <Textarea
            value={JSON.stringify(field.conditionals || [], null, 2)}
            onChange={(e)=> {
              try { onChange({ ...field, conditionals: JSON.parse(e.target.value) }); } catch { /* noop: keep user typing */ }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}