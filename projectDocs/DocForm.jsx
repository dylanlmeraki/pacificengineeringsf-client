import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TemplatePicker from "./TemplatePicker";
import { renderTemplateBody } from "@/components/utils/renderTemplate";
import DynamicDocForm from "./DynamicDocForm";

const TYPES = ["RFI","RFQ","RFP","Submittal","ASI","CCD","RFC","FieldReport"];

export default function DocForm({ initial, onSubmit, onCancel }) {
  const [doc, setDoc] = React.useState(initial || { doc_type: "RFQ", title: "", project_id: "", project_name: "" });
  const [selectedTpl, setSelectedTpl] = React.useState(null);
  const [dynValues, setDynValues] = React.useState({});
  const [pendingFiles, setPendingFiles] = React.useState([]);
  const [dragOver, setDragOver] = React.useState(false);
  const MAX_UPLOAD_SIZE = 25 * 1024 * 1024; // 25MB per file

  const addPendingFiles = (files) => {
    const list = Array.from(files || []);
    const valid = [];
    list.forEach((f) => {
      if (f.size > MAX_UPLOAD_SIZE) {
        // eslint-disable-next-line no-alert
        alert(`${f.name} exceeds 25MB and was skipped.`);
      } else {
        valid.push(f);
      }
    });
    if (valid.length) setPendingFiles((prev) => [...prev, ...valid]);
  };

  const removePending = (name) => {
    setPendingFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addPendingFiles(e.dataTransfer?.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...doc,
      template_name: selectedTpl?.template_name,
      template_meta: selectedTpl || undefined,
      dynamic_fields: Object.keys(dynValues).length ? dynValues : undefined
    };
    if (selectedTpl?.template_body) {
      // Best-effort client-side render (server also renders for consistency)
      payload.rendered_body = renderTemplateBody(selectedTpl.template_body, { doc: payload, fields: payload.dynamic_fields || {} });
    }
    onSubmit?.({ data: payload, files: pendingFiles });
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Type</label>
            <Select value={doc.doc_type} onValueChange={(v)=>setDoc({ ...doc, doc_type: v })}>
              <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Document No.</label>
            <Input value={doc.doc_number || ''} onChange={(e)=>setDoc({ ...doc, doc_number: e.target.value })} placeholder="#2026-001" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Project ID</label>
            <Input value={doc.project_id} onChange={(e)=>setDoc({ ...doc, project_id: e.target.value })} placeholder="project id" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Project Name</label>
            <Input value={doc.project_name || ''} onChange={(e)=>setDoc({ ...doc, project_name: e.target.value })} placeholder="Project name" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">Title</label>
          <Input value={doc.title} onChange={(e)=>setDoc({ ...doc, title: e.target.value })} placeholder="Title" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-2">Choose a template</label>
          <TemplatePicker docType={doc.doc_type} onSelect={setSelectedTpl} />
        </div>

        {selectedTpl?.field_sections?.length ? (
          <DynamicDocForm template={selectedTpl} doc={doc} onChange={setDynValues} />
        ) : null}

        {/* Pending attachments (will upload after create) */}
        <div className={`border rounded-md p-3 ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
             onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
             onDragLeave={()=> setDragOver(false)}
             onDrop={onDrop}
        >
          <div className="text-xs text-gray-500">Attach files (PDF, DOCX, JPG, PNG, GIF, CSV, XLSX) • Max 25MB each</div>
          <div className="mt-2 flex items-center gap-2">
            <label className="inline-flex items-center gap-2">
              <input type="file" multiple accept=".pdf,.docx,.jpg,.jpeg,.png,.gif,.csv,.xlsx"
                     onChange={(e)=> addPendingFiles(e.target.files)} className="hidden" />
              <Button type="button" variant="outline" onClick={(e)=>{
                const labelEl = e.currentTarget.closest('label');
                const input = labelEl ? labelEl.querySelector('input[type="file"]') : null;
                if (input) input.click();
              }}>Select files</Button>
            </label>
            <span className="text-xs text-gray-500">{pendingFiles.length ? `${pendingFiles.length} file(s) queued` : 'No files selected'}</span>
          </div>
          {pendingFiles.length > 0 && (
            <div className="mt-2 space-y-1">
              {pendingFiles.map((f) => (
                <div key={f.name} className="flex items-center justify-between text-xs border rounded px-2 py-1">
                  <div className="truncate mr-2">{f.name} • {(f.size/1024/1024).toFixed(2)}MB</div>
                  <Button type="button" size="sm" variant="ghost" onClick={()=>removePending(f.name)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </div>
  );
}