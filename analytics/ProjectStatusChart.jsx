import React from "react";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

const STATUS_COLORS = {
  Planning: "#6366f1",
  "In Progress": "#3b82f6",
  "On Hold": "#f59e0b",
  "Under Review": "#8b5cf6",
  Completed: "#22c55e",
  Closed: "#6b7280",
};

export default function ProjectStatusChart({ projects = [] }) {
  const data = React.useMemo(() => {
    const counts = {};
    projects.forEach((p) => {
      const s = p.status || "Unknown";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  return (
    <Card className="p-6 border-0 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h3>
      {data.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">No projects</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}