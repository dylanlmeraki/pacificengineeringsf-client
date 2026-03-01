import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projectDocsApi } from "@/components/services/projectDocsApiClient";
import ReactQuill from "react-quill";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Types
export type FieldKind = "text" | "textarea" | "number" | "date" | "dropdown" | "checkbox" | "radio" | "multiselect" | "boolean";
export type ConditionalOp = "equals" | "not_equals" | "in" | "not_in" | "truthy" | "falsy";

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  default_value?: string | number | boolean | string[] | null;
  mapping?: { source?: "Project" | "ProjectDoc"; path?: string };
  conditionals?: Array<{ field_key: string; operator: ConditionalOp; value?: any; action?: "show" | "hide" }>;
}
export interface SectionDef { section_id: string; label: string; fields: FieldDef[] }
export interface TemplateRecord {
  id?: string;
  template_name: string;
  description?: string;
  doc_type: "RFQ"|"RFP"|"Submittal"|"ASI"|"CCD"|"RFC"|"FieldReport";
  template_body?: string;
  field_sections?: SectionDef[];
}

const DOC_TYPES = ["RFQ","RFP","Submittal","ASI","CCD","RFC","FieldReport"] as const;

export default function TemplateEditor() {
  const qc = useQueryClient();
  const [template, setTemplate] = useState<TemplateRecord>({ template_name: "New Template", doc_type: "RFQ", field_sections: [], template_body: "<p></p>" });
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);

  const currentSection = useMemo(() => template.field_sections?.find(s => s.section_id === selectedSectionId) || null, [template, selectedSectionId]);
  const currentField = useMemo(() => currentSection?.fields.find(f => f.key === selectedFieldKey) || null, [currentSection, selectedFieldKey]);

  const upsert = useMutation({
    mutationFn: async () => projectDocsApi.upsertTemplate(template, template.id || null),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projectdoc_templates', template.doc_type] }); }
  });

  const addSection = () => {
    const id = `sec_${Date.now()}`;
    const newSec: SectionDef = { section_id: id, label: `Section ${template.field_sections?.length ? template.field_sections.length + 1 : 1}`, fields: [] };
    setTemplate(t => ({ ...t, field_sections: [...(t.field_sections || []), newSec] }));
    setSelectedSectionId(id);
  };

  const addField = (kind: FieldKind) => {
    if (!currentSection) return;
    const key = `field_${currentSection.fields.length + 1}`;
    const newField: FieldDef = { key, label: `Field ${currentSection.fields.length + 1}`, kind, required: false };
    setTemplate(t => ({
      ...t,
      field_sections: (t.field_sections || []).map(s => s.section_id === currentSection.section_id ? { ...s, fields: [...s.fields, newField] } : s)
    }));
    setSelectedFieldKey(key);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination, type } = result;

    if (type === 'SECTION') {
      const items = Array.from(template.field_sections || []);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      setTemplate(t => ({ ...t, field_sections: items }));
      return;
    }

    const section = (template.field_sections || [])[source.droppableId as any];
    const toSection = (template.field_sections || [])[destination.droppableId as any];
    if (!section || !toSection) return;

    const sourceFields = Array.from(section.fields);
    const [moved] = sourceFields.splice(source.index, 1);

    const destFields = section === toSection ? sourceFields : Array.from(toSection.fields);
    destFields.splice(destination.index, 0, moved);

    setTemplate(t => ({
      ...t,
      field_sections: (t.field_sections || []).map((s, idx) => {
        if (idx === source.droppableId) return { ...s, fields: source === destination ? destFields : sourceFields } as any;
        if (idx === destination.droppableId) return { ...s, fields: destFields } as any;
        return s;
      })
    }));
  };

  const validateTemplate = (): string[] => {
    const errs: string[] = [];
    const keys = new Set<string>();
    (template.field_sections || []).forEach(sec => {
      sec.fields.forEach(f => {
        if (keys.has(f.key)) errs.push(`Duplicate key: ${f.key}`);
        keys.add(f.key);
        if ((f.kind === 'dropdown' || f.kind === 'radio' || f.kind === 'multiselect') && (!f.options || f.options.length === 0)) {
          errs.push(`Field ${f.label} requires options`);
        }
        (f.conditionals || []).forEach(c => {
          if (!c.field_key || !c.operator) errs.push(`Invalid conditional in ${f.label}`);
        });
      });
    });
    if (!template.template_name) errs.push('Template name is required');
    return errs;
  };

  const handleSave = () => {
    const errs = validateTemplate();
    if (errs.length) {
      alert(`Please fix the following before saving:\n- ${errs.join('\n- ')}`);
      return;
    }
    upsert.mutate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
      {/* Left: Sections & Fields */}
      <Card className="lg:col-span-3 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Sections & Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button size="sm" variant="outline" onClick={addSection}>Add Section</Button>
            <Separator className="my-2"/>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections" type="SECTION">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {(template.field_sections || []).map((sec, sIdx) => (
                      <Draggable key={sec.section_id} draggableId={sec.section_id} index={sIdx}>
                        {(p) => (
                          <div ref={p.innerRef} {...p.draggableProps} className="border rounded-md">
                            <div className="px-2 py-1 bg-slate-50 flex items-center justify-between" {...p.dragHandleProps}>
                              <button className={`text-left text-sm font-medium ${selectedSectionId===sec.section_id?'text-slate-900':'text-slate-600'}`} onClick={()=>{setSelectedSectionId(sec.section_id); setSelectedFieldKey(null);}}>
                                {sec.label}
                              </button>
                              <div className="text-xs text-slate-500">{sec.fields.length} fields</div>
                            </div>
                            <Droppable droppableId={String(sIdx)} type="FIELD">
                              {(dp) => (
                                <div ref={dp.innerRef} {...dp.droppableProps} className="p-2 space-y-1">
                                  {sec.fields.map((f, fIdx) => (
                                    <Draggable key={`${sec.section_id}_${f.key}`} draggableId={`${sec.section_id}_${f.key}`} index={fIdx}>
                                      {(fp) => (
                                        <div ref={fp.innerRef} {...fp.draggableProps} {...fp.dragHandleProps}>
                                          <button className={`w-full text-left text-xs px-2 py-1 rounded ${selectedFieldKey===f.key?'bg-indigo-50 text-indigo-700':'hover:bg-slate-50'}`} onClick={()=>{setSelectedSectionId(sec.section_id); setSelectedFieldKey(f.key);}}>
                                            {f.label} <span className="text-slate-400">({f.kind})</span>
                                          </button>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {dp.placeholder}
                                </div>
                              )}
                            </Droppable>

                            {selectedSectionId===sec.section_id && (
                              <div className="px-2 pb-2 flex flex-wrap gap-1">
                                {(["text","textarea","number","date","dropdown","checkbox","radio","multiselect","boolean"] as FieldKind[]).map(k => (
                                  <Button key={k} size="sm" variant="ghost" onClick={()=>addField(k)}>{k}</Button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </CardContent>
      </Card>

      {/* Center: Rich Editor */}
      <Card className="lg:col-span-6">
        <CardHeader>
          <CardTitle className="text-base">Template Body</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500">Template Name</label>
              <Input value={template.template_name} onChange={(e)=>setTemplate(t=>({...t, template_name: e.target.value}))}/>
            </div>
            <div>
              <label className="text-xs text-slate-500">Doc Type</label>
              <Select value={template.doc_type} onValueChange={(v:any)=>setTemplate(t=>({...t, doc_type: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{DOC_TYPES.map(t=> <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <label className="text-xs text-slate-500">Description</label>
          <Textarea value={template.description||''} onChange={(e)=>setTemplate(t=>({...t, description: e.target.value}))}/>

          <div className="border rounded-md overflow-hidden">
            <ReactQuill theme="snow" value={template.template_body||''} onChange={(html)=>setTemplate(t=>({...t, template_body: html}))} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-2">
            <span>Insert placeholder:</span>
            <Button type="button" size="sm" variant="outline" onClick={()=>setTemplate(t=>({...t, template_body: (t.template_body||'') + ' {{doc.title}}' }))}>doc.title</Button>
            <Button type="button" size="sm" variant="outline" onClick={()=>setTemplate(t=>({...t, template_body: (t.template_body||'') + ' {{project.project_name}}' }))}>project.project_name</Button>
            {(template.field_sections||[]).flatMap(s=>s.fields).map(f=>(
              <Button key={f.key} type="button" size="sm" variant="ghost" onClick={()=>setTemplate(t=>({...t, template_body: (t.template_body||'') + ` {{${f.key}}}` }))}>{f.key}</Button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>window.history.back()}>Back</Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>{upsert.isPending? 'Saving…':'Save Template'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Right: Field Settings */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Field Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!currentField && <div className="text-sm text-slate-500">Select a field to edit its settings.</div>}
          {currentField && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500">Key</label>
                <Input value={currentField.key} onChange={(e)=>{
                  const v = e.target.value; setTemplate(t=>({
                    ...t,
                    field_sections: (t.field_sections||[]).map(s=> s.section_id===currentSection!.section_id ? ({...s, fields: s.fields.map(f=> f.key===currentField.key? {...f, key: v}: f)}) : s)
                  })); setSelectedFieldKey(v);
                }} />
              </div>
              <div>
                <label className="text-xs text-slate-500">Label</label>
                <Input value={currentField.label} onChange={(e)=> setTemplate(t=>({
                  ...t,
                  field_sections: (t.field_sections||[]).map(s=> s.section_id===currentSection!.section_id ? ({...s, fields: s.fields.map(f=> f.key===currentField.key? {...f, label: e.target.value}: f)}) : s)
                }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500">Placeholder</label>
                <Input value={currentField.placeholder||''} onChange={(e)=> setTemplate(t=>({
                  ...t,
                  field_sections: (t.field_sections||[]).map(s=> s.section_id===currentSection!.section_id ? ({...s, fields: s.fields.map(f=> f.key===currentField.key? {...f, placeholder: e.target.value}: f)}) : s)
                }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Kind</label>
                  <Select value={currentField.kind} onValueChange={(v:any)=> setTemplate(t=>({
                    ...t,
                    field_sections: (t.field_sections||[]).map(s=> s.section_id===currentSection!.section_id ? ({...s, fields: s.fields.map(f=> f.key===currentField.key? {...f, kind: v as FieldKind}: f)}) : s)
                  }))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {["text","textarea","number","date","dropdown","checkbox","radio","multiselect","boolean"].map(k=> <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Required</label>
                  <Select value={String(!!currentField.required)} onValueChange={(v:any)=> setTemplate(t=>({
                    ...t,
                    field_sections: (t.field_sections||[]).map(s=> s.section_id===currentSection!.section_id ? ({...s, fields: s.fields.map(f=> f.key===currentField.key? {...f, required: v === 'true'}: f)}) : s)
                  }))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(currentField.kind === 'dropdown' || currentField.kind === 'radio' || currentField.kind === 'multiselect') && (
                <div>
                  <label className="text-xs text-slate-500">Options (comma separated)</label>
                  <Input value={(currentField.options||[]).join(', ')} onChange={(e)=>{
                    const arr = e.target.value.split(',').map(s=>s.trim()).filter(Boolean);
                    setTemplate(t=>({
                      ...t,
                      field_sections: (t.field_sections||[]).map(s=> s.section_id===currentSection!.section_id ? ({...s, fields: s.fields.map(f=> f.key===currentField.key? {...f, options: arr}: f)}) : s)
                    }));
                  }} />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-500">Default Value</label>
                <Input value={String(currentField.default_value ?? '')} onChange={(e)=> setTemplate(t=>({
                  ...t,
                  field_sections: (t.field_sections||[]).map(s=> s.section_id===currentSection!.section_id ? ({...s, fields: s.fields.map(f=> f.key===currentField.key? {...f, default_value: e.target.value}: f)}) : s)
                }))} />
              </div>

              <div>
                <label className="text-xs text-slate-500">Mapping</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={currentField.mapping?.source || 'Project'} onValueChange={(v:any)=> setTemplate(t=>({
                    ...t,
                    field_sections: (t.field_sections||[]).map(s=> s.section_id===currentSection!.section_id ? ({...s, fields: s.fields.map(f=> f.key===currentField.key? {...f, mapping: { ...(f.mapping||{}), source: v }}: f)}) : s)
                  }))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Project">Project</SelectItem>
                      <SelectItem value="ProjectDoc">ProjectDoc</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="path e.g. project_name" value={currentField.mapping?.path || ''} onChange={(e)=> setTemplate(t=>({
                    ...t,
                    field_sections: (t.field_sections||[]).map(s=> s.section_id===currentSection!.section_id ? ({...s, fields: s.fields.map(f=> f.key===currentField.key? {...f, mapping: { ...(f.mapping||{}), path: e.target.value }}: f)}) : s)
                  }))} />
                </div>
              </div>

              <Separator/>
              <div className="text-xs text-slate-500">Use {{field.key}} in the body to insert a field value. Standard: {{doc.title}}, {{project.project_name}} etc.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}