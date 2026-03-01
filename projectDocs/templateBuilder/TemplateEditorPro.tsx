import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { renderTemplateBody } from "@/components/utils/renderTemplate";

export type TemplateEditorProProps = {
  initial?: any;
};

export default function TemplateEditorPro({ initial }: TemplateEditorProProps) {
  const [templateName, setTemplateName] = React.useState<string>(initial?.template_name || "New Template");
  const [docType] = React.useState<string>(initial?.doc_type || "RFQ");
  const [body, setBody] = React.useState<string>(
    initial?.template_body || "<h2>{{doc.title}}</h2><p>Project: {{project.project_name}}</p>"
  );
  const [preview, setPreview] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);

  // Translate legacy [[customField]] => {{fields.customField}} (back-compat only)
  const normalizeLegacy = (html: string) =>
    html.replace(/\[\[\s*([^\]]+)\s*\]\]/g, (_m, key) => `{{fields.${String(key).trim()}}}`);

  const doPreview = () => {
    const sampleDoc = { title: "Sample Doc", project_name: "Demo Project", status: "draft" };
    const normalized = normalizeLegacy(body);
    setPreview(
      renderTemplateBody(normalized, {
        doc: sampleDoc,
        project: { project_name: sampleDoc.project_name },
        fields: { example: "Value" },
      })
    );
  };

  const doSave = async () => {
    setSaving(true);
    try {
      const values = {
        template_name: templateName,
        doc_type: docType,
        field_sections: [],
        template_body: normalizeLegacy(body),
        active: true,
      };

      // Prefer function (for portability), fallback to direct entity ops
      if (base44.functions?.invoke) {
        const res = await base44.functions.invoke("projectDocsApi", {
          action: "upsertTemplate",
          data: { id: initial?.id || null, values },
        });
        if (res?.data?.template) return;
      }
      if (initial?.id) {
        await base44.entities.ProjectDocTemplate.update(initial.id, values);
      } else {
        await base44.entities.ProjectDocTemplate.create(values);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-4 space-y-3">
        <Card>
          <CardHeader className="flex items-center justify-between flex-row">
            <CardTitle>Template</CardTitle>
            <div className="text-xs text-slate-500">{docType}</div>
          </CardHeader>
          <CardContent className="space-y-2">
            <input
              className="w-full border rounded px-2 py-1"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={doPreview}>
                Preview
              </Button>
              <Button size="sm" onClick={doSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Template Body</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactQuill theme="snow" value={body} onChange={setBody} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none min-h-[240px] border rounded p-3 bg-white"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}