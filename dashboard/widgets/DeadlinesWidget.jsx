import React from "react";
import { format, parseISO, isAfter } from "date-fns";

function Row({ title, type, date }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0">
      <div>
        <div className="font-medium text-slate-800">{title}</div>
        <div className="text-xs text-slate-500">{type}</div>
      </div>
      <div className="text-sm text-slate-700">{date ? format(parseISO(date), 'PP') : '-'}</div>
    </div>
  );
}

export default function DeadlinesWidget({ docs = [], tasks = [] }) {
  const now = new Date();
  const items = [];
  docs.forEach(d => { if (d.due_date) items.push({ title: d.title || d.doc_number || 'Document', type: `Doc • ${d.doc_type||''}`.trim(), date: d.due_date }); });
  tasks.forEach(t => { if (t.due_date) items.push({ title: t.title, type: `Task • ${t.task_type||''}`.trim(), date: t.due_date }); });

  const upcoming = items
    .filter(i => !isAfter(new Date(i.date), new Date(now.getTime() + 1000*60*60*24*90)))
    .sort((a,b)=> new Date(a.date) - new Date(b.date))
    .slice(0, 12);

  return (
    <div className="bg-white rounded-md divide-y">
      {upcoming.map((i, idx)=>(<Row key={idx} {...i} />))}
      {!upcoming.length && <div className="text-sm text-slate-500 p-2">No upcoming deadlines.</div>}
    </div>
  );
}