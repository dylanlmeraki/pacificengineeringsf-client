import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { startOutreachSequence } from '@/functions/startOutreachSequence';

export default function SequenceLibraryModal({ open, onClose }) {
  const { data: presets = [] } = useQuery({ queryKey: ['sequence-presets'], queryFn: ()=> base44.entities.SequencePreset.list('-updated_date', 100), initialData: [] });
  const { data: sequences = [] } = useQuery({ queryKey: ['email-sequences'], queryFn: ()=> base44.entities.EmailSequence.list('-updated_date', 100), initialData: [] });
  const { data: prospects = [] } = useQuery({ queryKey: ['prospects-all'], queryFn: ()=> base44.entities.Prospect.list('-created_date', 300), initialData: [] });

  const [selectedSeqId, setSelectedSeqId] = useState('');
  const [selectedProspects, setSelectedProspects] = useState([]);
  const [trackingDomain, setTrackingDomain] = useState('');
  const [abSplit, setAbSplit] = useState(50);
  const [dynamicDelay, setDynamicDelay] = useState(false);

  const selectedSeq = useMemo(()=> sequences.find(s=>s.id===selectedSeqId), [sequences, selectedSeqId]);

  if (!open) return null;

  const toggleProspect = (id) => setSelectedProspects(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  const cloneFromPreset = async (preset) => {
    const cfg = preset.sequence_config || {};
    await base44.entities.EmailSequence.create({ ...cfg, sequence_name: `${cfg.sequence_name || 'Sequence'} (clone)` });
  };

  const handleStart = async () => {
    if (!selectedSeq || selectedProspects.length===0) return;
    await startOutreachSequence({ sequence_id: selectedSeq.id, prospect_ids: selectedProspects, tracking_domain: trackingDomain || selectedSeq.default_tracking_domain, ab_metric: selectedSeq.ab_metric || 'opens', ab_split_percent: abSplit, dynamic_delay_enabled: dynamicDelay });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Sequences Library</h3>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 p-4 max-h-[70vh] overflow-auto">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Saved Presets</h4>
            <div className="space-y-2">
              {presets.length === 0 && <div className="text-sm text-gray-500">No presets yet.</div>}
              {presets.map(p => (
                <div key={p.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.preset_name}</div>
                    <div className="text-xs text-gray-500">AB: {p.ab_metric} • Split: {p.ab_split_percent ?? 50}%</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>cloneFromPreset(p)}>Clone to Sequences</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-2">Start From Saved Sequence</h4>
            <div className="space-y-2">
              <Select value={selectedSeqId} onValueChange={setSelectedSeqId}>
                <SelectTrigger><SelectValue placeholder="Choose a sequence" /></SelectTrigger>
                <SelectContent>
                  {sequences.map(s => (<SelectItem key={s.id} value={s.id}>{s.sequence_name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input placeholder="Tracking domain (https://yourdomain.com)" value={trackingDomain} onChange={e=>setTrackingDomain(e.target.value)} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">A/B Split A%</span>
                <Input type="number" value={abSplit} onChange={e=>setAbSplit(Number(e.target.value))} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={dynamicDelay} onChange={e=>setDynamicDelay(e.target.checked)} /> Dynamic delays
                </label>
              </div>
              <div className="border rounded-lg p-2 max-h-60 overflow-auto">
                {prospects.map(p => (
                  <label key={p.id} className="flex items-center gap-2 p-1">
                    <input type="checkbox" checked={selectedProspects.includes(p.id)} onChange={()=>toggleProspect(p.id)} />
                    <span className="text-sm">{p.contact_name} • {p.company_name}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleStart} disabled={!selectedSeqId || selectedProspects.length===0}>Start Sequence</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}