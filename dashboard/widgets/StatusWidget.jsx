import React from "react";

export default function StatusWidget({ projects = [] }) {
  const groups = projects.reduce((acc, p) => {
    const k = p.status || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(groups).sort((a,b)=>b[1]-a[1]);

  return (
    <div className="space-y-2">
      {entries.map(([status, count]) => (
        <div key={status} className="flex items-center justify-between p-2 border rounded-md bg-white">
          <div className="text-slate-700">{status}</div>
          <div className="text-slate-900 font-semibold">{count}</div>
        </div>
      ))}
      {!entries.length && <div className="text-sm text-slate-500">No projects yet.</div>}
    </div>
  );
}