import React from "react";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function CommunicationPatternsChart({ messages = [] }) {
  const data = React.useMemo(() => {
    const weeks = {};
    messages.forEach((m) => {
      const d = new Date(m.created_date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { week: key, count: 0, internal: 0, client: 0 };
      weeks[key].count += 1;
      if (m.is_internal) weeks[key].internal += 1;
      else weeks[key].client += 1;
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)).slice(-12);
  }, [messages]);

  return (
    <Card className="p-6 border-0 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Patterns</h3>
      {data.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">No message data</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="client" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Client Messages" />
            <Area type="monotone" dataKey="internal" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" name="Internal Messages" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}