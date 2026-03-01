import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
// AI function imports
import { aiSuggestEmailContent } from '@/functions/aiSuggestEmailContent';
import { aiOptimizeABTest } from '@/functions/aiOptimizeABTest';
import { aiSuggestDelayRules } from '@/functions/aiSuggestDelayRules';

export default function SequenceEditor({ sequence, templates = [], onSave, onCancel }) {
  const [form, setForm] = useState({ sequence_name: '', description: '', steps: [], approval_required: true, active: true });

  useEffect(() => { if (sequence) setForm({ sequence_name: sequence.sequence_name || '', description: sequence.description || '', steps: sequence.steps || [], approval_required: sequence.approval_required ?? true, active: sequence.active ?? true }); }, [sequence]);

  const [aiLoading, setAiLoading] = useState(null); // step index or null
  const [aiSuggestions, setAiSuggestions] = useState({}); // { [stepIndex]: { content?, ab?, delay? } }

  async function handleSuggestContent(stepIndex) {
    try {
      setAiLoading(stepIndex);
      const step = form.steps[stepIndex] || {};
      const tpl = templates.find(t => t.id === step.template_id);
      const payload = {
        template_name: tpl?.template_name,
        current_subject: tpl?.subject,
        current_body_html: tpl?.body_html,
        prospect_attributes: {} // could be enhanced later with dynamic context
      };
      const { data } = await aiSuggestEmailContent(payload);
      setAiSuggestions(prev => ({ ...prev, [stepIndex]: { ...(prev[stepIndex]||{}), content: data?.suggestions } }));
    } finally {
      setAiLoading(null);
    }
  }

  async function handleOptimizeAB(stepIndex) {
    if (!sequence?.id) { alert('Save the sequence first to analyze A/B performance.'); return; }
    try {
      setAiLoading(stepIndex);
      const { data } = await aiOptimizeABTest({ sequence_id: sequence.id, step_index: stepIndex });
      setAiSuggestions(prev => ({ ...prev, [stepIndex]: { ...(prev[stepIndex]||{}), ab: data } }));
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSuggestDelay(stepIndex) {
    if (!sequence?.id) { alert('Save the sequence first to suggest delay rules.'); return; }
    try {
      setAiLoading(stepIndex);
      const { data } = await aiSuggestDelayRules({ sequence_id: sequence.id, step_index: stepIndex });
      setAiSuggestions(prev => ({ ...prev, [stepIndex]: { ...(prev[stepIndex]||{}), delay: data } }));
    } finally {
      setAiLoading(null);
    }
  }

  const addStep = () => setForm({ ...form, steps: [...form.steps, { step_name: '', template_id: '', delay_days: 0, send_via: 'platform', ab_enabled: false, ab_template_ids: ['', ''], delay_mode: 'fixed', min_delay_hours: 0, max_delay_hours: 24, branching_rules: [] }] });
  const updateStep = (i, patch) => setForm({ ...form, steps: form.steps.map((s, idx) => idx === i ? { ...s, ...patch } : s) });
  const removeStep = (i) => setForm({ ...form, steps: form.steps.filter((_, idx) => idx !== i) });
  const moveStep = (i, dir) => {
    const next = [...form.steps];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setForm({ ...form, steps: next });
  };

  const handleSubmit = (e) => { e.preventDefault(); onSave({ ...form, steps: (form.steps||[]).map(s => ({ ...s, ab_template_ids: s.ab_enabled ? s.ab_template_ids : [] })) }); };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="Sequence name" value={form.sequence_name} onChange={e=>setForm({ ...form, sequence_name: e.target.value })} />
      <Textarea placeholder="Description" value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} />
      <div className="space-y-3">
        {form.steps.map((step, i) => (
          <div key={i} className="p-3 rounded-lg border space-y-2">
            <div className="grid gap-2 md:grid-cols-6">
              <Input className="md:col-span-2" placeholder="Step name" value={step.step_name || ''} onChange={e=>updateStep(i, { step_name: e.target.value })} />
              <Select value={step.template_id} onValueChange={(v)=>updateStep(i, { template_id: v })}>
                <SelectTrigger className="md:col-span-2"><SelectValue placeholder="Template" /></SelectTrigger>
                <SelectContent>
                  {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.template_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" className="md:col-span-1" placeholder="Delay (days)" value={step.delay_days} onChange={e=>updateStep(i, { delay_days: Number(e.target.value) })} />
              <Select value={step.send_via} onValueChange={(v)=>updateStep(i, { send_via: v })}>
                <SelectTrigger><SelectValue placeholder="Send via" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="resend">Resend</SelectItem>
                  <SelectItem value="inhouse">In-House</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 md:grid-cols-6 items-center">
              <Select value={step.delay_mode || 'fixed'} onValueChange={(v)=>updateStep(i, { delay_mode: v })}>
                <SelectTrigger className="md:col-span-2"><SelectValue placeholder="Delay mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="engagement_dynamic">Dynamic (engagement)</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" className="md:col-span-2" placeholder="Min delay (hrs)" value={step.min_delay_hours ?? 0} onChange={e=>updateStep(i, { min_delay_hours: Number(e.target.value) })} />
              <Input type="number" className="md:col-span-2" placeholder="Max delay (hrs)" value={step.max_delay_hours ?? 24} onChange={e=>updateStep(i, { max_delay_hours: Number(e.target.value) })} />
            </div>

            <div className="grid gap-2 md:grid-cols-6 items-center">
              <Select value={String(step.ab_enabled)} onValueChange={(v)=>updateStep(i, { ab_enabled: v === 'true' })}>
                <SelectTrigger className="md:col-span-2"><SelectValue placeholder="A/B testing" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">A/B Off</SelectItem>
                  <SelectItem value="true">A/B On</SelectItem>
                </SelectContent>
              </Select>
              {step.ab_enabled && (
                <>
                  <Select value={step.ab_template_ids?.[0] || ''} onValueChange={(v)=>updateStep(i, { ab_template_ids: [v, step.ab_template_ids?.[1] || ''] })}>
                    <SelectTrigger className="md:col-span-2"><SelectValue placeholder="Template A" /></SelectTrigger>
                    <SelectContent>
                      {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.template_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={step.ab_template_ids?.[1] || ''} onValueChange={(v)=>updateStep(i, { ab_template_ids: [step.ab_template_ids?.[0] || '', v] })}>
                    <SelectTrigger className="md:col-span-2"><SelectValue placeholder="Template B" /></SelectTrigger>
                    <SelectContent>
                      {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.template_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Branching rules</div>
              {(step.branching_rules || []).map((r, ri) => (
                <div key={ri} className="grid gap-2 md:grid-cols-6 items-center">
                  <Select value={r.on_event} onValueChange={(v)=>{
                    const br=[...(step.branching_rules||[])]; br[ri]={...br[ri], on_event: v}; updateStep(i, { branching_rules: br });
                  }}>
                    <SelectTrigger className="md:col-span-2"><SelectValue placeholder="On event" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opened">Opened</SelectItem>
                      <SelectItem value="clicked">Clicked</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="no_reply_days">No reply (days)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" className="md:col-span-2" placeholder="Go to step index" value={r.go_to_step_index ?? 0} onChange={e=>{
                    const br=[...(step.branching_rules||[])]; br[ri]={...br[ri], go_to_step_index: Number(e.target.value)}; updateStep(i, { branching_rules: br });
                  }} />
                  <Input type="number" className="md:col-span-1" placeholder="After days" value={r.after_days ?? ''} onChange={e=>{
                    const br=[...(step.branching_rules||[])]; br[ri]={...br[ri], after_days: Number(e.target.value)}; updateStep(i, { branching_rules: br });
                  }} />
                  <Button type="button" variant="ghost" onClick={()=>{
                    const br=[...(step.branching_rules||[])]; br.splice(ri,1); updateStep(i, { branching_rules: br });
                  }}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={()=>updateStep(i, { branching_rules: [...(step.branching_rules||[]), { on_event: 'opened', go_to_step_index: i+1 }] })}>Add Rule</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => handleSuggestContent(i)} disabled={aiLoading===i}>AI Suggest Content</Button>
              <Button type="button" variant="outline" onClick={() => handleOptimizeAB(i)} disabled={aiLoading===i}>Optimize A/B</Button>
              <Button type="button" variant="outline" onClick={() => handleSuggestDelay(i)} disabled={aiLoading===i}>Suggest Delay & Branching</Button>
            </div>

            {aiSuggestions[i]?.content && (
              <div className="mt-3 p-3 border rounded-md bg-gray-50">
                <div className="text-sm font-semibold mb-1">AI Content Suggestions</div>
                <div className="text-xs text-gray-600">Subjects:</div>
                <ul className="list-disc ml-5 text-sm">
                  {(aiSuggestions[i].content.subject_suggestions||[]).map((s,idx)=>(<li key={idx}>{s}</li>))}
                </ul>
                {Array.isArray(aiSuggestions[i].content.body_suggestions) && aiSuggestions[i].content.body_suggestions[0] && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600">Body Suggestion:</div>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiSuggestions[i].content.body_suggestions[0] }} />
                  </div>
                )}
              </div>
            )}

            {aiSuggestions[i]?.ab && (
              <div className="mt-3 p-3 border rounded-md bg-gray-50">
                <div className="text-sm font-semibold mb-1">A/B Recommendation</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(aiSuggestions[i].ab, null, 2)}</pre>
              </div>
            )}

            {aiSuggestions[i]?.delay && (
              <div className="mt-3 p-3 border rounded-md bg-gray-50">
                <div className="text-sm font-semibold mb-1">Delay & Branching Suggestion</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(aiSuggestions[i].delay, null, 2)}</pre>
              </div>
            )}

            <div className="flex justify-between">
              <div className="text-xs text-gray-500">Step {i+1}</div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={()=>moveStep(i,-1)}>Move Up</Button>
                <Button type="button" variant="ghost" onClick={()=>moveStep(i,1)}>Move Down</Button>
                <Button type="button" variant="ghost" onClick={()=>removeStep(i)}>Remove</Button>
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addStep}>Add Step</Button>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Sequence</Button>
      </div>
    </form>
  );
}