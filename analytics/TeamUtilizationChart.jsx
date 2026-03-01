import React from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function TeamUtilizationChart({ projects = [], tasks = [] }) {
  const data = React.useMemo(() => {
    const memberMap = {};
    projects.forEach((p) => {
      (p.assigned_team_members || []).forEach((email) => {
        if (!memberMap[email]) memberMap[email] = { name: email.split("@")[0], projects: 0, tasks: 0 };
        memberMap[email].projects += 1;
      });
    });
    tasks.forEach((t) => {
      const email = t.assigned_to;
      if (email) {
        if (!memberMap[email]) memberMap[email] = { name: email.split("@")[0], projects: 0, tasks: 0 };
        memberMap[email].tasks += 1;
      }
    });
    return Object.values(memberMap).sort((a, b) => b.projects + b.tasks - (a.projects + a.tasks)).slice(0, 15);
  }, [projects, tasks]);

  return (
    <Card className="p-6 border-0 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Utilization</h3>
      {data.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">No team data</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="projects" fill="#6366f1" name="Projects" radius={[0, 4, 4, 0]} />
            <Bar dataKey="tasks" fill="#22c55e" name="Tasks" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}