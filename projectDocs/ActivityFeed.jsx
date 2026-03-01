import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ActivityFeed({ entityName, entityId }) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["audit", entityName, entityId],
    queryFn: async () => {
      if (!entityName || !entityId) return [];
      return base44.entities.AuditLog.filter({ resource_type: entityName, resource_id: entityId }, '-created_date', 50);
    },
    enabled: !!entityName && !!entityId,
    initialData: [],
  });

  if (isLoading) {
    return <div className="text-xs text-slate-500">Loading activity…</div>;
  }

  if (!items.length) {
    return <div className="text-xs text-slate-500">No activity yet.</div>;
  }

  return (
    <div className="space-y-3 text-xs">
      {items.map((e) => (
        <div key={e.id} className="relative pl-4">
          <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-slate-400" />
          <div className="text-slate-700">
            <span className="font-medium">{e.actor_name || e.actor_email || 'System'}</span>
            {" "}performed {e.action?.replaceAll('_',' ')}
          </div>
          <div className="text-slate-500">{new Date(e.created_date).toLocaleString()}</div>
          {e.details && <div className="text-slate-600 mt-0.5">{e.details}</div>}
        </div>
      ))}
    </div>
  );
}