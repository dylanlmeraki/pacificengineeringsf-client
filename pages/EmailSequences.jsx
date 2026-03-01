import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import SequenceEditor from '@/components/communications/SequenceEditor';
import SequenceAnalytics from '@/components/communications/SequenceAnalytics';
import { getChallengerPresets } from '@/components/communications/ChallengerPresets';
import { startOutreachSequence } from "@/functions/startOutreachSequence";

export default function EmailSequences() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [startMode, setStartMode] = useState(false);
  const [selectedProspects, setSelectedProspects] = useState([]);

  const { data: templates = [] } = useQuery({ queryKey: ['email-templates'], queryFn: ()=> base44.entities.EmailTemplate.list('-updated_date', 100), initialData: [] });
  const { data: sequences = [] } = useQuery({ queryKey: ['email-sequences'], queryFn: ()=> base44.entities.EmailSequence.list('-updated_date', 100), initialData: [] });
  const { data: prospects = [] } = useQuery({ queryKey: ['prospects-all'], queryFn: ()=> base44.entities.Prospect.list('-created_date', 200), initialData: [] });
  const { data: presets = [] } = useQuery({ queryKey: ['sequence-presets'], queryFn: ()=> base44.entities.SequencePreset.list('-updated_date', 50), initialData: [] });

  const upsert = useMutation({
    mutationFn: (s)=> s.id ? base44.entities.EmailSequence.update(s.id, s) : base44.entities.EmailSequence.create(s),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ['email-sequences'] })
  });

  const [activeSequence, setActiveSequence] = useState(null);
  const [trackingDomain, setTrackingDomain] = useState("");
  const [abSplit, setAbSplit] = useState(50);
  const [dynamicDelay, setDynamicDelay] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const startSequence = async () => {
    if (!activeSequence || selectedProspects.length === 0) return;
    await startOutreachSequence({ sequence_id: activeSequence.id, prospect_ids: selectedProspects, tracking_domain: trackingDomain || activeSequence.default_tracking_domain, ab_metric: activeSequence.ab_metric || 'opens', ab_split_percent: abSplit, dynamic_delay_enabled: dynamicDelay });
    setStartMode(false); setSelectedProspects([]);
  };

  const toggleProspect = (id) => setSelectedProspects(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  const addChallengerPresets = async () => {
    setSeeding(true);
    try {
      const { templates: tplDefs, sequences: seqDefs } = getChallengerPresets();
      // Ensure templates exist (avoid dups by name)
      const existingTpls = templates; // from query
      const nameToId = new Map(existingTpls.map(t => [t.template_name, t.id]));
      for (const t of tplDefs) {
        if (!nameToId.has(t.template_name)) {
          const created = await base44.entities.EmailTemplate.create({
            template_name: t.template_name,
            category: t.category,
            subject: t.subject,
            body_html: t.body_html,
            variables: t.variables,
            notes: t.notes
          });
          nameToId.set(created.template_name, created.id);
        }
      }
      // Create sequences if missing
      const existingSeqs = sequences; // from query
      const existingNames = new Set(existingSeqs.map(s => s.sequence_name));
      for (const s of seqDefs) {
        if (existingNames.has(s.sequence_name)) continue;
        const steps = s.steps.map(step => ({
          step_name: step.step_name,
          template_id: nameToId.get(step.template_ref),
          delay_days: step.delay_days,
          send_via: 'platform',
          delay_mode: 'fixed'
        }));
        const createdSeq = await base44.entities.EmailSequence.create({
          sequence_name: s.sequence_name,
          description: s.description,
          steps,
          active: true,
          approval_required: true,
          ab_test_enabled: false
        });
        // Save a preset snapshot for fast reuse
        try {
          await base44.entities.SequencePreset.create({
            preset_name: `${s.sequence_name} (Preset)`,
            description: s.description,
            sequence_config: createdSeq,
            default_tracking_domain: '',
            ab_metric: 'opens',
            ab_split_percent: 50
          });
        } catch (_) {}
      }
      qc.invalidateQueries({ queryKey: ['email-sequences'] });
      qc.invalidateQueries({ queryKey: ['email-templates'] });
      qc.invalidateQueries({ queryKey: ['sequence-presets'] });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Email Sequences</h1>
        <div className="flex items-center gap-2">
          <Select onValueChange={(id)=>{
            const p = presets.find(x=>x.id===id); if (!p) return; if (activeSequence) { setTrackingDomain(p.default_tracking_domain || ''); setAbSplit(p.ab_split_percent ?? 50); }
          }}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Load preset for start" /></SelectTrigger>
            <SelectContent>
              {presets.map(p => (<SelectItem key={p.id} value={p.id}>{p.preset_name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button onClick={async ()=>{
            if (!activeSequence) return; await base44.entities.SequencePreset.create({ preset_name: `${activeSequence.sequence_name} preset`, description: '', sequence_config: activeSequence, default_tracking_domain: trackingDomain, ab_metric: activeSequence.ab_metric || 'opens', ab_split_percent: abSplit });
          }}>Save as Preset</Button>
          <Button variant="outline" onClick={addChallengerPresets} disabled={seeding}>{seeding ? 'Adding…' : 'Add Challenger Presets'}</Button>
          <Button onClick={()=>setEditing({ steps: [] })}>New Sequence</Button>
        </div>
      </div>

      {editing && (
        <Card className="p-4 mb-6">
          <SequenceEditor sequence={editing} templates={templates} onCancel={()=>setEditing(null)} onSave={async (data)=>{ await upsert.mutateAsync(data); try { await base44.entities.SequenceVersion.create({ sequence_id: editing.id, version_number: (editing.version || 1) + 1, snapshot: data }); } catch (_) {} setEditing(null); }} />
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {sequences.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold">{s.sequence_name}</h3>
                <div className="text-sm text-gray-500">{s.active ? 'Active' : 'Inactive'} • {s.steps?.length || 0} steps</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={()=>setEditing(s)}>Edit</Button>
                <Button onClick={()=>{ setActiveSequence(s); setTrackingDomain(s.default_tracking_domain || ''); setAbSplit(s.ab_split_percent ?? 50); setStartMode(true); }}>Start</Button>
              </div>
            </div>
            {/* Analytics summary */}
            <SequenceAnalytics sequenceId={s.id} />
          </Card>
        ))}
      </div>

      {startMode && activeSequence && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Start Sequence: {activeSequence.sequence_name}</h3>
            <Button variant="ghost" onClick={()=>{ setStartMode(false); setSelectedProspects([]); }}>Close</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Input placeholder="Tracking domain (https://yourdomain.com)" value={trackingDomain} onChange={e=>setTrackingDomain(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">A/B Split A%</span>
              <Input type="number" value={abSplit} onChange={e=>setAbSplit(Number(e.target.value))} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={dynamicDelay} onChange={e=>setDynamicDelay(e.target.checked)} /> Dynamic delays
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-2 max-h-[300px] overflow-auto">
            {prospects.map(p => (
              <label key={p.id} className="flex items-center gap-2 p-2 rounded border">
                <input type="checkbox" checked={selectedProspects.includes(p.id)} onChange={()=>toggleProspect(p.id)} />
                <div>
                  <div className="font-medium">{p.contact_name} • {p.company_name}</div>
                  <div className="text-xs text-gray-500">{p.status}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={startSequence} disabled={selectedProspects.length===0}>Start for {selectedProspects.length} prospect(s)</Button>
          </div>
        </Card>
      )}
    </div>
  );
}