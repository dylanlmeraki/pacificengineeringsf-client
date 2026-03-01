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
  ReferenceLine
} from "recharts";

export default function BudgetTrackingChart({ projects = [], invoices = [] }) {
  const data = React.useMemo(() => {
    return projects
      .filter((p) => p.budget > 0)
      .map((p) => {
        const projectInvoices = invoices.filter((i) => i.project_id === p.id);
        const invoiced = projectInvoices.reduce((s, i) => s + (i.total_amount || 0), 0);
        const paid = projectInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + (i.total_amount || 0), 0);
        return {
          name: (p.project_name || "").length > 20 ? p.project_name.slice(0, 18) + "…" : p.project_name,
          budget: p.budget,
          invoiced,
          paid,
        };
      })
      .slice(0, 12);
  }, [projects, invoices]);

  return (
    <Card className="p-6 border-0 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs. Invoiced vs. Paid</h3>
      {data.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">No projects with budgets</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="budget" fill="#e2e8f0" name="Budget" radius={[4, 4, 0, 0]} />
            <Bar dataKey="invoiced" fill="#6366f1" name="Invoiced" radius={[4, 4, 0, 0]} />
            <Bar dataKey="paid" fill="#22c55e" name="Paid" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}