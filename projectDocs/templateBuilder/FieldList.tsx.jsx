import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export type FieldKind = "text"|"textarea"|"number"|"date"|"dropdown"|"checkbox"|"radio"|"multiselect"|"boolean";

export interface BuilderField {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  default_value?: any;
  mapping?: { source?: "Project"|"ProjectDoc"; path?: string };
  conditionals?: Array<{ field_key: string; operator: "equals"|"not_equals"|"in"|"not_in"|"truthy"|"falsy"; value?: any; action?: "show"|"hide" }>;
}

export interface BuilderSection { section_id: string; label: string; fields: BuilderField[]; }

export default function FieldList({ sections, onChange, onSelect }: {
  sections: BuilderSection[];
  onChange: (next: BuilderSection[]) => void;
  onSelect?: (field?: { sectionIndex: number; fieldIndex: number } | null) => void;
}) {
  const addSection = () => {
    const next = [...sections, { section_id: `sec_${Date.now()}`, label: `Section ${sections.length + 1}` , fields: [] }];
    onChange(next);
  };
  const addField = (i: number) => {
    const next = sections.map((s, idx) => idx!==i? s: { ...s, fields: [...s.fields, { key: `field_${Date.now()}`, label: "New Field", kind: "text" }] });
    onChange(next);
  };
  const removeField = (si: number, fi: number) => {
    const next = sections.map((s, idx) => idx!==si? s: { ...s, fields: s.fields.filter((_, j)=> j!==fi) });
    onChange(next);
    onSelect?.(null);
  };
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    const copy = JSON.parse(JSON.stringify(sections)) as BuilderSection[];
    if (type === "SECTION") {
      const [moved] = copy.splice(source.index, 1);
      copy.splice(destination.index, 0, moved);
      onChange(copy);
      return;
    }
    // field drag
    const sFrom = copy[source.droppableId as any];
    const sTo = copy[destination.droppableId as any];
    const [moved] = sFrom.fields.splice(source.index, 1);
    sTo.fields.splice(destination.index, 0, moved);
    onChange(copy);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between flex-row">
        <CardTitle>Sections & Fields</CardTitle>
        <Button size="sm" onClick={addSection}><Plus className="h-4 w-4 mr-1"/>Add Section</Button>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections" type="SECTION">
            {(prov) => (
              <div ref={prov.innerRef} {...prov.droppableProps} className="space-y-3">
                {sections.map((sec, si) => (
                  <Draggable draggableId={sec.section_id} index={si} key={sec.section_id}>
                    {(p) => (
                      <div ref={p.innerRef} {...p.draggableProps} className="border rounded-lg">
                        <div className="flex items-center gap-2 p-2 bg-slate-50 border-b">
                          <div {...p.dragHandleProps} className="cursor-grab text-slate-400"><GripVertical className="h-4 w-4"/></div>
                          <Input value={sec.label} onChange={(e)=>{
                            const next = sections.slice();
                            next[si] = { ...sec, label: e.target.value };
                            onChange(next);
                          }} />
                          <Button size="sm" variant="outline" onClick={()=>addField(si)}><Plus className="h-4 w-4 mr-1"/>Field</Button>
                        </div>
                        <Droppable droppableId={String(si)} type="FIELD">
                          {(prov2)=> (
                            <div ref={prov2.innerRef} {...prov2.droppableProps} className="p-2 space-y-2">
                              {sec.fields.map((f, fi)=> (
                                <Draggable draggableId={`${sec.section_id}_${f.key}`} index={fi} key={`${sec.section_id}_${f.key}`}>
                                  {(p2)=> (
                                    <div ref={p2.innerRef} {...p2.draggableProps} className="flex items-center gap-2 border rounded p-2 hover:bg-slate-50">
                                      <div {...p2.dragHandleProps} className="cursor-grab text-slate-400"><GripVertical className="h-4 w-4"/></div>
                                      <button className="flex-1 text-left" onClick={()=> onSelect?.({ sectionIndex: si, fieldIndex: fi })}>
                                        <div className="text-sm font-medium">{f.label || f.key}</div>
                                        <div className="text-xs text-slate-500">{f.kind}</div>
                                      </button>
                                      <Button size="icon" variant="ghost" onClick={()=>removeField(si, fi)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {prov2.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {prov.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}