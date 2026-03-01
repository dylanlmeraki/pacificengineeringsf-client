import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, format, parseISO, max, min } from "date-fns";

const STATUS_COLORS = {
  Planning: "#6366f1",
  "In Progress": "#3b82f6",
  "On Hold": "#f59e0b",
  "Under Review": "#8b5cf6",
  Completed: "#22c55e",
  Closed: "#6b7280",
};

export default function GanttChart({ projects = [] }) {
  const { items, minDate, totalDays } = useMemo(() => {
    const withDates = projects.filter((p) => p.start_date);
    if (!withDates.length) return { items: [], minDate: new Date(), totalDays: 1 };

    const starts = withDates.map((p) => parseISO(p.start_date));
    const ends = withDates.map((p) => parseISO(p.estimated_completion || p.start_date));
    const earliest = min(starts);
    const latest = max(ends);
    const days = Math.max(differenceInDays(latest, earliest), 1);

    const items = withDates.map((p) => {
      const start = parseISO(p.start_date);
      const end = parseISO(p.estimated_completion || p.start_date);
      const offsetDays = differenceInDays(start, earliest);
      const durationDays = Math.max(differenceInDays(end, start), 1);
      const leftPct = (offsetDays / days) * 100;
      const widthPct = Math.max((durationDays / days) * 100, 2);
      return { ...p, leftPct, widthPct, start, end };
    });

    return { items, minDate: earliest, totalDays: days };
  }, [projects]);

  if (items.length === 0) {
    return (
      <Card className="p-8 border-0 shadow-lg text-center text-gray-500">
        No projects with start dates to display on the Gantt chart.
      </Card>
    );
  }

  // Generate month markers
  const months = useMemo(() => {
    const markers = [];
    const start = new Date(items[0]?.start || new Date());
    start.setDate(1);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + totalDays + 30);
    let current = new Date(start);
    while (current <= endDate) {
      const dayOffset = differenceInDays(current, items.reduce((m, i) => (i.start < m ? i.start : m), items[0].start));
      const pct = Math.max(0, (dayOffset / totalDays) * 100);
      if (pct <= 100) markers.push({ label: format(current, "MMM yyyy"), pct });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    return markers;
  }, [items, totalDays]);

  return (
    <Card className="p-6 border-0 shadow-lg overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Month headers */}
          <div className="relative h-8 border-b mb-2">
            {months.map((m, i) => (
              <div
                key={i}
                className="absolute text-xs text-gray-500 font-medium"
                style={{ left: `${Math.min(m.pct, 95)}%` }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Gantt rows */}
          <div className="space-y-2">
            {items.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-40 flex-shrink-0 truncate text-sm font-medium text-gray-700" title={p.project_name}>
                  {p.project_name}
                </div>
                <div className="flex-1 relative h-8 bg-gray-100 rounded">
                  <div
                    className="absolute top-1 h-6 rounded-md flex items-center px-2 text-xs text-white font-medium truncate transition-all"
                    style={{
                      left: `${p.leftPct}%`,
                      width: `${p.widthPct}%`,
                      backgroundColor: STATUS_COLORS[p.status] || "#94a3b8",
                      minWidth: "20px",
                    }}
                    title={`${p.project_name}: ${format(p.start, "MMM d")} – ${format(p.end, "MMM d")}`}
                  >
                    {p.widthPct > 8 ? p.status : ""}
                  </div>
                  {/* Progress overlay */}
                  {(p.progress_percentage || 0) > 0 && (
                    <div
                      className="absolute top-1 h-6 rounded-md bg-white/30"
                      style={{
                        left: `${p.leftPct}%`,
                        width: `${(p.widthPct * (p.progress_percentage || 0)) / 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}