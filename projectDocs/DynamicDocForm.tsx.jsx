import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

// Minimal types mirroring editor
type FieldKind = "text" | "textarea" | "number" | "date" | "dropdown" | "checkbox" | "radio" | "multiselect" | "boolean";
interface FieldDef { key: string; label: string; kind: FieldKind; placeholder?: string; required?: boolean; options?: string[]; default_value?: any; mapping?: { source?: "Project"|"ProjectDoc"; path?: string }; conditionals?: Array<{ field_key: string; operator: string; value?: any; action?: "show"|"hide" }> }
interface SectionDef { section_id: string; label: string; fields: FieldDef[] }
interface TemplateRecord { field_sections?: SectionDef[] }

export default function DynamicDocForm({ template, doc, onChange }: { template: TemplateRecord; doc: any; onChange: (vals: Record<string, any>) => void }) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [project, setProject] = useState<any>(null);

  // Load project if needed for mappings
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!doc?.project_id) { setProject(null); return; }
      // Only fetch if at least one field maps to Project
      const needsProject = (template.field_sections||[]).some(sec => sec.fields.some(f => f.mapping?.source === 'Project'));
      if (!needsProject) return;
      const list = await base44.entities.Project.filter({ id: doc.project_id }, undefined, 1);
      if (isMounted) setProject(list?.[0] || null);
    };
    load();
    return () => { isMounted = false };
  }, [doc?.project_id, template]);

  // Initialize defaults + mappings once
  useEffect(() => {
    const init: Record<string, any> = {};
    (template.field_sections||[]).forEach(sec => sec.fields.forEach(f => {
      if (f.default_value !== undefined && f.default_value !== null) init[f.key] = f.default_value;
    }));
    setValues(v => ({ ...init, ...v }));
  }, [template]);

  // Apply mappings when data available
  useEffect(() => {
    const mapped: Record<string, any> = {};
    const getPath = (obj: any, path?: string) => {
      if (!obj || !path) return undefined;
      return path.split('.').reduce((acc, k) => (acc ? (acc as any)[k] : undefined), obj);
    };
    (template.field_sections||[]).forEach(sec => sec.fields.forEach(f => {
      if (f.mapping?.source === 'Project') {
        const val = getPath(project, f.mapping.path);
        if (val !== undefined && val !== null) mapped[f.key] = val;
      } else if (f.mapping?.source === 'ProjectDoc') {
        const val = getPath(doc, f.mapping.path);
        if (val !== undefined && val !== null) mapped[f.key] = val;
      }
    }));
    if (Object.keys(mapped).length) setValues(v => ({ ...mapped, ...v }));
  }, [project, doc, template]);

  useEffect(() => { onChange(values); }, [values, onChange]);

  const isVisible = (f: FieldDef) => {
    const conds = f.conditionals || [];
    if (conds.length === 0) return true;
    return conds.every(c => {
      const other = values[c.field_key];
      switch (c.operator) {
        case 'equals': return other === c.value;
        case 'not_equals': return other !== c.value;
        case 'in': return Array.isArray(c.value) && c.value.includes(other);
        case 'not_in': return Array.isArray(c.value) && !c.value.includes(other);
        case 'truthy': return !!other;
        case 'falsy': return !other;
        default: return true;
      }
    });
  };

  const renderField = (f: FieldDef) => {
    if (!isVisible(f)) return null;
    const common = (
      <div className="space-y-1">
        <label className="text-xs text-slate-500">{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
      </div>
    );
    const set = (val: any) => setValues(v => ({ ...v, [f.key]: val }));

    switch (f.kind) {
      case 'text':
        return (<div key={f.key}>{common}<Input placeholder={f.placeholder} value={values[f.key] || ''} onChange={e=>set(e.target.value)} /></div>);
      case 'textarea':
        return (<div key={f.key}>{common}<Textarea placeholder={f.placeholder} value={values[f.key] || ''} onChange={e=>set(e.target.value)} /></div>);
      case 'number':
        return (<div key={f.key}>{common}<Input type="number" placeholder={f.placeholder} value={values[f.key] ?? ''} onChange={e=>set(Number(e.target.value))} /></div>);
      case 'date':
        return (<div key={f.key}>{common}<Input type="date" value={values[f.key] || ''} onChange={e=>set(e.target.value)} /></div>);
      case 'dropdown':
        return (
          <div key={f.key}>{common}
            <Select value={values[f.key] || ''} onValueChange={set}>
              <SelectTrigger><SelectValue placeholder={f.placeholder || 'Select'} /></SelectTrigger>
              <SelectContent>
                {(f.options||[]).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        );
      case 'radio':
        return (
          <div key={f.key}>{common}
            <div className="flex flex-wrap gap-3">
              {(f.options||[]).map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={f.key} checked={values[f.key]===opt} onChange={()=>set(opt)} /> {opt}
                </label>
              ))}
            </div>
          </div>
        );
      case 'checkbox':
        return (
          <div key={f.key} className="flex items-center gap-2">{common}<input type="checkbox" checked={!!values[f.key]} onChange={e=>set(e.target.checked)} /></div>
        );
      case 'multiselect':
        return (
          <div key={f.key}>{common}
            <div className="grid grid-cols-2 gap-2">
              {(f.options||[]).map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={Array.isArray(values[f.key]) && values[f.key].includes(opt)} onChange={(e)=>{
                    const cur: string[] = Array.isArray(values[f.key])? values[f.key] : [];
                    set(e.target.checked ? Array.from(new Set([...cur, opt])) : cur.filter(x=>x!==opt));
                  }} /> {opt}
                </label>
              ))}
            </div>
          </div>
        );
      case 'boolean':
        return (<div key={f.key} className="flex items-center gap-2">{common}<input type="checkbox" checked={!!values[f.key]} onChange={e=>set(e.target.checked)} /></div>);
      default:
        return null;
    }
  };

  if (!(template.field_sections||[]).length) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">Template Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {(template.field_sections||[]).map(sec => (
            <div key={sec.section_id}>
              <div className="text-sm font-medium text-slate-700 mb-2">{sec.label}</div>
              <div className="space-y-3">
                {sec.fields.map(renderField)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}