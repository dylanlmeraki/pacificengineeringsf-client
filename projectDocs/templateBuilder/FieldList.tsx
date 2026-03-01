import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, FolderPlus, Pencil } from "lucide-react";

export type FieldDef = {
  key: string;
  label: string;
  kind: string;
};

export type SectionDef = {
  section_id: string;
  label: string;
  fields: FieldDef[];
};

export default function FieldList({
  sections,
  onChange,
  onSelectField,
}: {
  sections: SectionDef[];
  onChange: (next: SectionDef[]) => void;
  onSelectField: (secId: string, fieldKey?: string) => void;
}) {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const src = result.source;
    const dst = result.destination;

    const next = structuredClone(sections);

    // Reorder sections
    if (src.droppableId === "sections" && dst.droppableId === "sections") {
      const [removed] = next.splice(src.index, 1);
      next.splice(dst.index, 0, removed);
      onChange(next);
      return;
    }

    // Move fields within/between sections
    const [fromType, fromId] = src.droppableId.split(":");
    const [toType, toId] = dst.droppableId.split(":");
    if (fromType === "fields" && toType === "fields") {
      const fromSec = next.find((s) => s.section_id === fromId);
      const toSec = next.find((s) => s.section_id === toId);
      if (!fromSec || !toSec) return;
      const [moved] = fromSec.fields.splice(src.index, 1);
      toSec.fields.splice(dst.index, 0, moved);
      onChange(next);
    }
  };

  const addSection = () => {
    const id = `sec_${Date.now()}`;
    onChange([...(sections || []), { section_id: id, label: "New Section", fields: [] }]);
  };

  const addField = (secId: string) => {
    const key = `field_${Date.now()}`;
    const next = (sections || []).map((s) =>
      s.section_id === secId ? { ...s, fields: [...(s.fields || []), { key, label: "Untitled", kind: "text" }] } : s
    );
    onChange(next);
    onSelectField(secId, key);
  };

  const renameSection = (secId: string, label: string) => {
    onChange((sections || []).map((s) => (s.section_id === secId ? { ...s, label } : s)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Sections & Fields</div>
        <Button size="sm" variant="outline" onClick={addSection} className="gap-1">
          <FolderPlus className="w-4 h-4" /> Section
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections" type="SECTION">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {(sections || []).map((sec, sIdx) => (
                <Draggable key={sec.section_id} draggableId={sec.section_id} index={sIdx}>
                  {(sp) => (
                    <div ref={sp.innerRef} {...sp.draggableProps} className="border rounded-lg">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 border-b">
                        <span {...sp.dragHandleProps} className="text-slate-400">
                          <GripVertical className="w-4 h-4" />
                        </span>
                        <input
                          className="flex-1 bg-transparent outline-none text-sm"
                          value={sec.label}
                          onChange={(e) => renameSection(sec.section_id, e.target.value)}
                        />
                        <Button size="sm" variant="ghost" onClick={() => addField(sec.section_id)} className="gap-1">
                          <Plus className="w-4 h-4" /> Field
                        </Button>
                      </div>

                      <Droppable droppableId={`fields:${sec.section_id}`} type="FIELD">
                        {(p2) => (
                          <div ref={p2.innerRef} {...p2.droppableProps} className="p-2 space-y-2">
                            {(sec.fields || []).map((f, fIdx) => (
                              <Draggable key={f.key} draggableId={`${sec.section_id}:${f.key}`} index={fIdx}>
                                {(dp) => (
                                  <div
                                    ref={dp.innerRef}
                                    {...dp.draggableProps}
                                    className="flex items-center gap-2 border rounded p-2 hover:bg-slate-50"
                                  >
                                    <span {...dp.dragHandleProps} className="text-slate-400">
                                      <GripVertical className="w-4 h-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium truncate">{f.label}</div>
                                      <div className="text-xs text-slate-500 truncate">{f.key} • {f.kind}</div>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => onSelectField(sec.section_id, f.key)}>
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {p2.placeholder}
                          </div>
                        )}
                      </Droppable>
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
  );
}