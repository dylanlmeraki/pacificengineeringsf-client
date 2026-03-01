import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus } from "lucide-react";

const STANDARD = {
  project: ["project_name", "client_email", "status", "priority", "start_date"],
  doc: ["title", "doc_number", "project_name", "status"],
};

export default function PlaceholderPicker({
  dynamicFields,
  onInsert,
}: {
  dynamicFields: string[];
  onInsert: (placeholder: string) => void;
}) {
  const insert = (token: string) => onInsert(token);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1"><Plus className="w-4 h-4"/> Placeholder</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2 text-sm">
          <div className="font-medium">Project</div>
          <div className="flex flex-wrap gap-1">
            {STANDARD.project.map((k) => (
              <button key={k} onClick={()=>insert(`{{project.${k}}}`)} className="px-2 py-0.5 rounded border hover:bg-slate-50">{`project.${k}`}</button>
            ))}
          </div>
          <div className="font-medium mt-2">Doc</div>
          <div className="flex flex-wrap gap-1">
            {STANDARD.doc.map((k) => (
              <button key={k} onClick={()=>insert(`{{doc.${k}}}`)} className="px-2 py-0.5 rounded border hover:bg-slate-50">{`doc.${k}`}</button>
            ))}
          </div>
          <div className="font-medium mt-2">Custom Fields</div>
          <div className="flex flex-wrap gap-1">
            {dynamicFields.map((k) => (
              <button key={k} onClick={()=>insert(`{{fields.${k}}}`)} className="px-2 py-0.5 rounded border hover:bg-slate-50">{`fields.${k}`}</button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}