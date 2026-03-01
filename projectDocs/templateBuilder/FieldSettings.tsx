import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Save } from "lucide-react";

const KINDS = ["text","textarea","number","date","dropdown","checkbox","radio","multiselect","boolean"] as const;

export default function FieldSettings({
  sectionId,
  field,
  onUpdate,
  onDelete,
}: {
  sectionId?: string;
  field?: any;
  onUpdate: (patch: any) => void;
  onDelete: () => void;
}) {
  if (!field) return (
    <div className="text-sm text-slate-500">Select a field to edit its settings.</div>
  );

  const update = (k: string, v: any) => onUpdate({ ...field, [k]: v });

  const ensureOptionsValid = () => {
    if ((field.kind === 'dropdown' || field.kind === 'radio' || field.kind === 'multiselect') && !(field.options || []).length) {
      // Add a default option to keep valid
      update('options', ['Option 1']);
    }
  };

  return (
    <div className="space-y-3">
      <div className="font-medium">Field Settings</div>

      <div className="grid gap-2">
        <div>
          <label className="text-xs text-slate-500">Key</label>
          <Input value={field.key} onChange={(e)=>update('key', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Label</label>
          <Input value={field.label} onChange={(e)=>update('label', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Control</label>
          <Select value={field.kind} onValueChange={(v)=>{ update('kind', v); }}>
            <SelectTrigger><SelectValue placeholder="Choose"/></SelectTrigger>
            <SelectContent>
              {KINDS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Placeholder</label>
          <Input value={field.placeholder || ''} onChange={(e)=>update('placeholder', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Default value</label>
          <Input value={(field.default_value ?? '') as any} onChange={(e)=>update('default_value', e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input id="required" type="checkbox" checked={!!field.required} onChange={(e)=>update('required', e.target.checked)} />
          <label htmlFor="required" className="text-sm">Required</label>
        </div>
        {(field.kind === 'dropdown' || field.kind === 'radio' || field.kind === 'multiselect') && (
          <div>
            <label className="text-xs text-slate-500">Options (comma separated)</label>
            <Textarea value={(field.options || []).join(', ')} onChange={(e)=>update('options', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} onBlur={ensureOptionsValid} />
          </div>
        )}

        <div>
          <label className="text-xs text-slate-500">Mapping (optional)</label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={field.mapping?.source || ''} onValueChange={(v)=>update('mapping', { ...(field.mapping||{}), source: v })}>
              <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="ProjectDoc">ProjectDoc</SelectItem>
              </SelectContent>
            </Select>
            <Input value={field.mapping?.path || ''} onChange={(e)=>update('mapping', { ...(field.mapping||{}), path: e.target.value })} placeholder="dot.path e.g. project_name" />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500">Conditional rules (JSON)</label>
          <Textarea
            placeholder='e.g. [{"field_key":"type","operator":"equals","value":"A","action":"show"}]'
            value={JSON.stringify(field.conditionals || [], null, 2)}
            onChange={(e)=>{
              try { const v = JSON.parse(e.target.value); onUpdate({ ...field, conditionals: Array.isArray(v)? v : [] }); }
              catch {}
            }}
          />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1"><Trash2 className="w-4 h-4"/> Delete</Button>
        <Button size="sm" className="gap-1" onClick={ensureOptionsValid}><Save className="w-4 h-4"/> Apply</Button>
      </div>
    </div>
  );
}