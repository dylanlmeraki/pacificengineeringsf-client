import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { renderTemplateBody, buildRenderContext } from "@/components/utils/renderTemplate";

export default function TemplateEditor() {
  const [name, setName] = React.useState("");
  const [body, setBody] = React.useState("<h2>{{doc.title}}</h2>\n<p>Project: {{doc.project_name}}</p>\n<p>{{fields.summary}}</p>");
  const [preview, setPreview] = React.useState("");

  const sampleDoc = { title: "Sample Title", project_name: "Demo Project" };
  const sampleFields = { summary: "This is a preview of your template body." };

  const doPreview = () => {
    const html = renderTemplateBody(body, buildRenderContext({ doc: sampleDoc, fields: sampleFields }));
    setPreview(html);
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="md:col-span-1">
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Template Name</label>
            <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="My Template" />
          </div>
          <div className="text-xs text-gray-600">
            Use placeholders like {"{{doc.title}}"}, {"{{doc.project_name}}"}, {"{{fields.my_key}}"}
          </div>
          <Button type="button" variant="outline" onClick={doPreview}>Preview</Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader><CardTitle>Body</CardTitle></CardHeader>
        <CardContent>
          <Textarea className="min-h-[360px]" value={body} onChange={(e)=>setBody(e.target.value)} />
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="prose max-w-none min-h-[360px] border rounded p-3 bg-white" dangerouslySetInnerHTML={{ __html: preview }} />
        </CardContent>
      </Card>
    </div>
  );
}