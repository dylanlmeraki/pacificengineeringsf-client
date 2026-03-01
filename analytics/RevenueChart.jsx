import React from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from "recharts";

export default function RevenueChart({ invoices = [], chartType = "bar" }) {
  const monthlyData = React.useMemo(() => {
    const months = {};
    invoices.forEach((inv) => {
      const date = inv.issue_date || inv.created_date;
      if (!date) return;
      const key = date.slice(0, 7);
      if (!months[key]) months[key] = { month: key, invoiced: 0, paid: 0, outstanding: 0 };
      months[key].invoiced += inv.total_amount || 0;
      if (inv.status === "paid") months[key].paid += inv.total_amount || 0;
      else if (["sent", "viewed", "overdue"].includes(inv.status))
        months[key].outstanding += inv.total_amount || 0;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  }, [invoices]);

  const Chart = chartType === "line" ? LineChart : BarChart;

  return (
    <Card className="p-6 border-0 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
      {monthlyData.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">No invoice data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <Chart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            <Legend />
            {chartType === "line" ? (
              <>
                <Line type="monotone" dataKey="invoiced" stroke="#6366f1" strokeWidth={2} name="Invoiced" />
                <Line type="monotone" dataKey="paid" stroke="#22c55e" strokeWidth={2} name="Paid" />
                <Line type="monotone" dataKey="outstanding" stroke="#f59e0b" strokeWidth={2} name="Outstanding" />
              </>
            ) : (
              <>
                <Bar dataKey="paid" fill="#22c55e" name="Paid" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" fill="#f59e0b" name="Outstanding" radius={[4, 4, 0, 0]} />
              </>
            )}
          </Chart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}