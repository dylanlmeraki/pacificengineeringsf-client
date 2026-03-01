import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FieldList, { BuilderSection, BuilderField } from "./FieldList";
import FieldSettings from "./FieldSettings";
import PlaceholderPicker from "./PlaceholderPicker";
import { base44 } from "@/api/base44Client";
import { renderTemplateBody } from "@/components/utils/renderTemplate";

export default function TemplateEditorPro({ initial }: { initial?: any }){
  const [templateName, setTemplateName] = React.useState<string>(initial?.template_name || "New Template");
  const [docType, setDocType] = React.useState<string>(initial?.doc_type || "RFQ");
  const [sections, setSections] = React.useState<BuilderSection[]>(initial?.field_sections || []);
  const [body, setBody] = React.useState<string>(initial?.template_body || "<h2>{{doc.title}}</h2><p>Project: {{project.project_name}}</p>");
  const [selected, setSelected] = React.useState<{ sectionIndex: number; fieldIndex: number } | null>(null);
  const [preview, setPreview] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);
  const field = selected ? sections[selected.sectionIndex]?.fields[selected.fieldIndex] : undefined;

  const insertPlaceholder = (ph: string) => {
    // naive insertion by appending; for real UX: use Quill API selection
    setBody((b)=> b + ` ${ph}`);
  };

  const updateField = (nextField: BuilderField) => {
    if (!selected) return;
    const copy = sections.slice();
    copy[selected.sectionIndex].fields[selected.fieldIndex] = nextField;
    setSections(copy);
  };

  const doPreview = () => {
    const sampleDoc = { title: "Sample Doc", project_name: "Demo Project", status: "draft" };
    const sampleFields = Object.fromEntries(
      sections.flatMap(s=> s.fields.map(f=> [f.key, f.default_value || f.placeholder || f.label || f.key]))
    );
    setPreview(renderTemplateBody(body, { doc: sampleDoc, project: { project_name: sampleDoc.project_name }, fields: sampleFields }));
  };

  const doSave = async () => {
    setSaving(true);
    try {
      const values = { template_name: templateName, doc_type: docType, field_sections: sections, template_body: body, active: true };
      if ((base44 as any).functions?.invoke) {
        // Prefer function wrapper if present
        const res = await (base44 as any).functions.invoke('projectDocsApi', { action: 'upsertTemplate', data: { id: initial?.id || null, values } });
        if (res?.data?.template) return;
      }
      // fallback to direct entity write
      if (initial?.id) {
        await (base44 as any).entities.ProjectDocTemplate.update(initial.id, values);
      } else {
        await (base44 as any).entities.ProjectDocTemplate.create(values);
      }
    } finally { setSaving(false); }
  };

  const fieldKeys = sections.flatMap(s=> s.fields.map(f=> f.key));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-3 space-y-3">
        <Card>
          <CardHeader className="flex items-center justify-between flex-row">
            <CardTitle>Details</CardTitle>
            <div className="text-xs text-slate-500">{docType}</div>
          </CardHeader>
          <CardContent className="space-y-2">
            <input className="w-full border rounded px-2 py-1" value={templateName} onChange={(e)=> setTemplateName(e.target.value)} />
            <div className="text-xs text-slate-500">Use {{...}} placeholders only.</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={doPreview}>Preview</Button>
              <Button size="sm" onClick={doSave} disabled={saving}>{saving? 'Saving…':'Save'}</Button>
            </div>
          </CardContent>
        </Card>
        <FieldList sections={sections} onChange={setSections} onSelect={setSelected} />
      </div>

      <div className="lg:col-span-6 space-y-3">
        <Card>
          <CardHeader><CardTitle>Template Body</CardTitle></CardHeader>
          <CardContent>
            <ReactQuill theme="snow" value={body} onChange={setBody} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="prose max-w-none min-h-[240px] border rounded p-3 bg-white" dangerouslySetInnerHTML={{ __html: preview }} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-3">
        <PlaceholderPicker onInsert={insertPlaceholder} fieldKeys={fieldKeys} />
        <FieldSettings field={field} onChange={updateField} />
      </div>
    </div>
  );
}