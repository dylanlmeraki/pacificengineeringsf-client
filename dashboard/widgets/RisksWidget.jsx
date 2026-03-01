import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RisksWidget({ projects = [], docs = [] }) {
  const [loading, setLoading] = React.useState(false);
  const [insights, setInsights] = React.useState("");

  const analyze = async () => {
    setLoading(true);
    const summary = {
      project_status: projects.reduce((acc, p)=>{ acc[p.status||'Unknown']=(acc[p.status||'Unknown']||0)+1; return acc;}, {}),
      overdue_docs: docs.filter(d => d.due_date && !['approved','answered','closed','rejected'].includes(String(d.status||'').toLowerCase())).length,
      recent_docs: docs.slice(0,20).map(d=>({type:d.doc_type, status:d.status, due:d.due_date?true:false}))
    };
    const prompt = `You are a construction PM risk analyst. Given this JSON summary of portfolio context, identify 3-6 concrete risks and 3-6 actionable mitigations. Be concise, bullet points.\n\nJSON:\n${JSON.stringify(summary, null, 2)}`;
    const res = await base44.integrations.Core.InvokeLLM({ prompt });
    setInsights(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    setLoading(false);
  };

  return (
    <div>
      <Button onClick={analyze} disabled={loading} className="mb-3 gap-2"><AlertTriangle className="w-4 h-4"/>{loading ? 'Analyzing...' : 'Analyze Risks'}</Button>
      {loading && <div className="flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin w-4 h-4"/> Generating insights...</div>}
      {insights && (
        <div className="prose prose-slate max-w-none text-sm">
          {insights.split('\n').map((l, i)=> <p key={i}>{l}</p>)}
        </div>
      )}
    </div>
  );
}