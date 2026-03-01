import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Save, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { projectDocsApi } from '@/components/services/projectDocsApiClient';

const CONTROL_TYPES = [
  { v: 'text', l: 'Text' },
  { v: 'textarea', l: 'Textarea' },
  { v: 'date', l: 'Date' },
  { v: 'number', l: 'Number' },
  { v: 'dropdown', l: 'Dropdown' },
  { v: 'radio', l: 'Radio' },
  { v: 'multiselect', l: 'Multi-select' },
];

export default function TemplateAIGenerator() {
  const [description, setDescription] = React.useState('');
  const [docType, setDocType] = React.useState('');
  const [allowed, setAllowed] = React.useState<string[]>(CONTROL_TYPES.map(c=>c.v));
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const toggleAllowed = (v: string) => {
    setAllowed((prev)=> prev.includes(v) ? prev.filter(x=>x!==v) : [...prev, v]);
  };

  const generate = async () => {
    setLoading(true);
    const prompt = `You are an expert at designing construction document templates. Create a structured template based on this description.\n- Include an HTML body with clear sections and {{placeholders}}.\n- Propose fields_def array with name, label, and type (one of: ${allowed.join(', ')}).\n- For dropdown/radio/multiselect, include an 'options' array of strings.\n- Prefer concise, professional wording.\n- If a doc type is provided, tailor sections/fields accordingly.\n\nDescription: ${description}\nDoc Type: ${docType || 'General'}`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          template_name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          template_body: { type: 'string' },
          fields_def: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                label: { type: 'string' },
                type: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } }
              },
              required: ['name','label','type']
            }
          }
        },
        required: ['template_body','fields_def']
      }
    });
    setResult(res);
    setLoading(false);
  };

  const save = async () => {
    if (!result) return;
    const values: any = {
      template_name: result.template_name || (docType ? `${docType} Template` : 'AI Template'),
      slug: (result.slug || (result.template_name || description || 'ai-template')).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''),
      description: result.description || description,
      template_body: result.template_body,
      fields_def: result.fields_def,
      category: 'General',
      active: true
    };
    await projectDocsApi.upsertTemplate(values, null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5"/> AI Template Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Brief description (e.g., SWPPP inspection report)" value={description} onChange={(e)=>setDescription(e.target.value)} />
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="w-80"><SelectValue placeholder="Optional: Choose doc type"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="RFI">RFI</SelectItem>
              <SelectItem value="RFQ">RFQ</SelectItem>
              <SelectItem value="RFP">RFP</SelectItem>
              <SelectItem value="Submittal">Submittal</SelectItem>
              <SelectItem value="FieldReport">Field Report</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <div className="text-sm font-medium mb-2">Allowed control types</div>
            <div className="flex flex-wrap gap-2">
              {CONTROL_TYPES.map(ct => (
                <button key={ct.v} onClick={()=>toggleAllowed(ct.v)} className={`px-2 py-1 text-xs rounded border ${allowed.includes(ct.v) ? 'bg-slate-900 text-white' : 'bg-white'}`}>{ct.l}</button>
              ))}
            </div>
          </div>
          <Button onClick={generate} disabled={!description || loading} className="gap-2">{loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Wand2 className="w-4 h-4"/>} Generate</Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Fields</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(result.fields_def||[]).map((f:any, i:number)=> (
                  <div key={i} className="p-2 border rounded-md bg-white">
                    <div className="font-medium">{f.label} <span className="text-xs text-slate-500">({f.type})</span></div>
                    {Array.isArray(f.options) && f.options.length>0 && (
                      <div className="text-xs text-slate-600">Options: {f.options.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Template Body (Preview)</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-md p-3 bg-white max-h-[440px] overflow-auto" dangerouslySetInnerHTML={{ __html: result.template_body }} />
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <div className="flex justify-end">
          <Button onClick={save} className="gap-2"><Save className="w-4 h-4"/>Save as Template</Button>
        </div>
      )}
    </div>
  );
}