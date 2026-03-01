import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PlaceholderPicker({ onInsert, fieldKeys }: { onInsert: (ph: string)=>void; fieldKeys: string[] }){
  const project = ["project.project_name","project.project_number","project.client_name","project.location","project.status"];
  const doc = ["doc.title","doc.doc_number","doc.due_date","doc.assigned_to","doc.status"];

  const Item = ({label}:{label:string}) => (
    <Button size="sm" variant="outline" className="justify-start w-full" onClick={()=> onInsert(`{{${label}}}`)}>{`{{${label}}}`}</Button>
  );

  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Placeholders</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-slate-500 mb-1">Project</div>
          <div className="grid grid-cols-1 gap-1">{project.map(k=> <Item key={k} label={k} />)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Document</div>
          <div className="grid grid-cols-1 gap-1">{doc.map(k=> <Item key={k} label={k} />)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Custom Fields</div>
          <div className="grid grid-cols-1 gap-1">{fieldKeys.map(k=> <Item key={k} label={`fields.${k}`} />)}</div>
        </div>
      </CardContent>
    </Card>
  );
}