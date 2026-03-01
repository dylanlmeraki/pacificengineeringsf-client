import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ListChecks, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { suggestProjectTasks } from "@/functions/suggestProjectTasks";
import { addDays } from "date-fns";

export default function TaskSuggestions({ projects = [] }) {
  const [projectId, setProjectId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [selected, setSelected] = React.useState({});

  const generate = async () => {
    if (!projectId) return;
    setLoading(true);
    const res = await suggestProjectTasks({ project_id: projectId });
    const suggestions = res?.data?.suggestions || [];
    setItems(suggestions);
    const sel = {}; suggestions.forEach((_, i)=> sel[i] = true); setSelected(sel);
    setLoading(false);
  };

  const createSelected = async () => {
    const chosen = items.filter((_, i)=> selected[i]);
    if (!chosen.length) return;
    const project = projects.find(p=>p.id===projectId);
    const payload = chosen.map(c => ({
      project_id: project?.id,
      project_name: project?.project_name,
      task_type: c.task_type || 'Other',
      title: c.title,
      description: c.notes || '',
      priority: c.priority || 'Medium',
      status: 'Pending',
      due_date: addDays(new Date(), Number((c.due_in_days ?? 7))).toISOString(),
      automated: true,
    }));
    await base44.entities.Task.bulkCreate(payload);
    setItems([]); setSelected({});
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Select a project"/></SelectTrigger>
          <SelectContent>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.project_name} ({p.project_type})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={generate} disabled={!projectId || loading} className="gap-2"><ListChecks className="w-4 h-4"/>{loading ? 'Generating...' : 'Suggest Tasks'}</Button>
      </div>
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((it, i)=> (
            <div key={i} className="flex items-start gap-3 p-3 border rounded-md bg-white">
              <Checkbox checked={!!selected[i]} onCheckedChange={(v)=> setSelected(s=> ({...s, [i]: v}))} />
              <div className="flex-1">
                <div className="font-medium text-slate-900">{it.title}</div>
                <div className="text-xs text-slate-500">Type: {it.task_type} • Priority: {it.priority} • {it.due_in_days ? `Due in ${it.due_in_days} days` : 'No due'}</div>
                {it.notes && <div className="text-sm text-slate-700 mt-1">{it.notes}</div>}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={createSelected} className="gap-2"><Save className="w-4 h-4"/>Create Selected Tasks</Button>
          </div>
        </div>
      )}
      {loading && <div className="flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin w-4 h-4"/> Working...</div>}
    </div>
  );
}