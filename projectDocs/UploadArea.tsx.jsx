import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { base44 } from "@/api/base44Client";
import { processAttachment } from "@/functions/processAttachment";

const ACCEPT = [".pdf", ".docx", ".jpg", ".jpeg", ".png", ".gif", ".csv", ".xlsx"];

export default function UploadArea({ docId, onComplete }: { docId: string; onComplete?: () => void }) {
  const [dragOver, setDragOver] = React.useState(false);
  const [items, setItems] = React.useState<{ name: string; progress: number; status: 'queued'|'uploading'|'processing'|'done'|'error'; error?: string }[]>([]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !docId) return;
    const arr = Array.from(files).filter(f => ACCEPT.some(ext => f.name.toLowerCase().endsWith(ext)));
    setItems(prev => [...prev, ...arr.map(f => ({ name: f.name, progress: 0, status: 'queued' }))]);

    for (const file of arr) {
      setItems(prev => prev.map(it => it.name === file.name ? { ...it, status: 'uploading', progress: 10 } : it));
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setItems(prev => prev.map(it => it.name === file.name ? { ...it, status: 'processing', progress: 70 } : it));
        const res = await processAttachment({ doc_id: docId, file_url, name: file.name, size: file.size });
        const ok = res?.data?.success;
        setItems(prev => prev.map(it => it.name === file.name ? { ...it, status: ok ? 'done' : 'error', progress: ok ? 100 : 90, error: res?.data?.error } : it));
      } catch (e:any) {
        setItems(prev => prev.map(it => it.name === file.name ? { ...it, status: 'error', error: e?.message || 'Upload failed' } : it));
      }
    }
    onComplete?.();
  };

  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle className="text-sm">Attachments</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${dragOver ? 'bg-slate-50' : ''}`}
          onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
          onDragLeave={()=>setDragOver(false)}
          onDrop={(e)=>{ e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        >
          <div className="text-sm text-slate-600 mb-2">Drag & drop files here or</div>
          <label className="inline-block">
            <input type="file" multiple accept={ACCEPT.join(',')} className="hidden" onChange={(e)=>handleFiles(e.target.files)} />
            <Button type="button" variant="outline" size="sm">Browse files</Button>
          </label>
          <div className="text-xs text-slate-500 mt-2">Accepted: PDF, DOCX, JPG, PNG, GIF, CSV, XLSX</div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 space-y-2">
            {items.map((it) => (
              <div key={it.name} className="text-sm">
                <div className="flex justify-between">
                  <span>{it.name}</span>
                  <span className={`text-xs ${it.status==='error' ? 'text-red-600' : 'text-slate-500'}`}>{it.status}</span>
                </div>
                <Progress value={it.progress} />
                {it.error && <div className="text-xs text-red-600">{it.error}</div>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}