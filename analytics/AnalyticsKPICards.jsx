import React from "react";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FolderOpen,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";

const KPI_CONFIGS = [
  { key: "activeProjects", label: "Active Projects", icon: FolderOpen, color: "bg-blue-600" },
  { key: "completedProjects", label: "Completed", icon: CheckCircle2, color: "bg-green-600" },
  { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, color: "bg-emerald-600", isCurrency: true },
  { key: "outstandingInvoices", label: "Outstanding", icon: DollarSign, color: "bg-amber-600", isCurrency: true },
  { key: "overdueItems", label: "Overdue Items", icon: AlertTriangle, color: "bg-red-600" },
  { key: "pendingTasks", label: "Pending Tasks", icon: Clock, color: "bg-purple-600" },
  { key: "teamMembers", label: "Team Members", icon: Users, color: "bg-indigo-600" },
  { key: "avgProjectProgress", label: "Avg Progress", icon: TrendingUp, color: "bg-cyan-600", isPercent: true },
];

function formatValue(value, isCurrency, isPercent) {
  if (isCurrency) return `$${(value || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
  if (isPercent) return `${Math.round(value || 0)}%`;
  return value ?? 0;
}

export default function AnalyticsKPICards({ kpis = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {KPI_CONFIGS.map(({ key, label, icon: Icon, color, isCurrency, isPercent }) => (
        <Card key={key} className="p-5 border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className={`${color} rounded-lg p-2.5`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatValue(kpis[key], isCurrency, isPercent)}
          </div>
          <div className="text-xs text-gray-500 mt-1">{label}</div>
        </Card>
      ))}
    </div>
  );
}