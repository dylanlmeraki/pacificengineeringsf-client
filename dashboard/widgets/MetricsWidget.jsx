import React from "react";
import { BarChart3, Calendar, AlertTriangle } from "lucide-react";
import { format, isBefore, addDays, parseISO } from "date-fns";

export default function MetricsWidget({ projects = [], docs = [], tasks = [] }) {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => ["Planning","In Progress","Under Review"].includes(p.status)).length;

  const now = new Date();
  const overdueDocs = docs.filter(d => d.due_date && isBefore(parseISO(d.due_date), now) && !["approved","answered","closed","rejected"].includes(String(d.status||'').toLowerCase())).length;
  const upcomingTasks = tasks.filter(t => t.due_date && isBefore(parseISO(t.due_date), addDays(now,7))).length;

  const Item = ({icon:Icon, label, value, color}) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border">
      <div className={`h-9 w-9 rounded-md flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <Item icon={BarChart3} label="Total Projects" value={totalProjects} color="bg-indigo-600" />
      <Item icon={BarChart3} label="Active Projects" value={activeProjects} color="bg-blue-600" />
      <Item icon={AlertTriangle} label="Overdue Docs" value={overdueDocs} color="bg-amber-600" />
      <Item icon={Calendar} label="Tasks in 7 Days" value={upcomingTasks} color="bg-emerald-600" />
    </div>
  );
}