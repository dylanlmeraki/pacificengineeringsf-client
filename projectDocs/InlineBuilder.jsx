import React from "react";
import { Button } from "@/components/ui/button";
import { projectDocsApi } from "@/components/services/projectDocsApiClient";
import ReactQuill from "react-quill";

export default function InlineBuilder({ docType, initial, onSaved }) {
  const [title, setTitle] = React.useState(initial?.template_name || "New Template");
  const [desc, setDesc] = React.useState(initial?.description || "");
  const [body, setBody] = React.useState(initial?.template_body || "");
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const values = { template_name: title, description: desc, template_body: body, doc_type: docType, active: true };
      const tpl = await projectDocsApi.upsertTemplate(values, initial?.id || null);
      onSaved?.(tpl);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <input className="w-full border rounded px-3 py-2" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Template name" />
      <input className="w-full border rounded px-3 py-2" value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Description (optional)" />
      <ReactQuill theme="snow" value={body} onChange={setBody} className="bg-white" />
      <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving? 'Saving…':'Save Template'}</Button></div>
    </div>
  );
}