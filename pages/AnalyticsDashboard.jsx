import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, PieChart, Users, Sparkles, FileText, DollarSign } from "lucide-react";
import AdminRoute from "@/components/internal/AdminRoute";

import AnalyticsKPICards from "@/components/analytics/AnalyticsKPICards";
import RevenueChart from "@/components/analytics/RevenueChart";
import ProjectStatusChart from "@/components/analytics/ProjectStatusChart";
import TeamUtilizationChart from "@/components/analytics/TeamUtilizationChart";
import AIInsightsPanel from "@/components/analytics/AIInsightsPanel";
import DataExporter from "@/components/analytics/DataExporter";
import CommunicationPatternsChart from "@/components/analytics/CommunicationPatternsChart";
import BudgetTrackingChart from "@/components/analytics/BudgetTrackingChart";
import ProposalDashboardPanel from "@/components/analytics/ProposalDashboardPanel.jsx";
import InvoiceManager from "@/components/invoices/InvoiceManager";

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [revenueChartType, setRevenueChartType] = useState("bar");

  const { data: projects = [] } = useQuery({
    queryKey: ["analytics-projects"],
    queryFn: () => base44.entities.Project.list("-created_date", 500),
    initialData: [],
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["analytics-invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date", 1000),
    initialData: [],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["analytics-tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 1000),
    initialData: [],
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["analytics-milestones"],
    queryFn: () => base44.entities.ProjectMilestone.list("-created_date", 1000),
    initialData: [],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["analytics-messages"],
    queryFn: () => base44.entities.ProjectMessage.list("-created_date", 1000),
    initialData: [],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["analytics-users"],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  // Date filtering
  const filterByDate = (items, dateField = "created_date") => {
    if (dateRange === "all") return items;
    const now = new Date();
    let start;
    if (dateRange === "7d") start = new Date(now.getTime() - 7 * 86400000);
    else if (dateRange === "30d") start = new Date(now.getTime() - 30 * 86400000);
    else if (dateRange === "90d") start = new Date(now.getTime() - 90 * 86400000);
    else if (dateRange === "1y") start = new Date(now.getTime() - 365 * 86400000);
    else return items;
    return items.filter((i) => i[dateField] && new Date(i[dateField]) >= start);
  };

  // Project filtering
  const filteredProjects = useMemo(() => {
    let p = filterByDate(projects);
    if (projectFilter !== "all") p = p.filter((pr) => pr.project_type === projectFilter);
    return p;
  }, [projects, dateRange, projectFilter]);

  const filteredInvoices = useMemo(() => {
    const pIds = new Set(filteredProjects.map((p) => p.id));
    let inv = filterByDate(invoices, "issue_date");
    if (projectFilter !== "all") inv = inv.filter((i) => pIds.has(i.project_id));
    return inv;
  }, [invoices, filteredProjects, dateRange, projectFilter]);

  const filteredTasks = useMemo(() => filterByDate(tasks), [tasks, dateRange]);
  const filteredMilestones = useMemo(() => filterByDate(milestones), [milestones, dateRange]);
  const filteredMessages = useMemo(() => filterByDate(messages), [messages, dateRange]);

  // KPI computation
  const kpis = useMemo(() => {
    const activeProjects = filteredProjects.filter((p) => ["Planning", "In Progress", "Under Review"].includes(p.status)).length;
    const completedProjects = filteredProjects.filter((p) => p.status === "Completed").length;
    const totalRevenue = filteredInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + (i.total_amount || 0), 0);
    const outstandingInvoices = filteredInvoices.filter((i) => ["sent", "viewed", "overdue"].includes(i.status)).reduce((s, i) => s + (i.total_amount || 0), 0);
    const overdueItems = filteredInvoices.filter((i) => i.status === "overdue").length + filteredTasks.filter((t) => t.status === "Pending" && t.due_date && new Date(t.due_date) < new Date()).length;
    const pendingTasks = filteredTasks.filter((t) => t.status === "Pending").length;
    const teamMembers = users.filter((u) => u.role === "admin").length;
    const avgProjectProgress = filteredProjects.length ? filteredProjects.reduce((s, p) => s + (p.progress_percentage || 0), 0) / filteredProjects.length : 0;

    return { activeProjects, completedProjects, totalRevenue, outstandingInvoices, overdueItems, pendingTasks, teamMembers, avgProjectProgress };
  }, [filteredProjects, filteredInvoices, filteredTasks, users]);

  return (
    <AdminRoute>
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finances / Analytics</h1>
            <p className="text-gray-600">Comprehensive portfolio performance, proposals, and invoices</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SWPPP">SWPPP</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Inspections">Inspections</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>
            <DataExporter projects={filteredProjects} invoices={filteredInvoices} tasks={filteredTasks} />
          </div>
        </div>

        {/* KPI Cards */}
        <AnalyticsKPICards kpis={kpis} />

        {/* Tabs for chart sections */}
        <Tabs defaultValue="financial" className="space-y-4">
          <TabsList>
            <TabsTrigger value="financial" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Financial
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <PieChart className="w-4 h-4" /> Projects
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" /> Team
            </TabsTrigger>
            <TabsTrigger value="proposals" className="gap-2">
              <FileText className="w-4 h-4" /> Proposals
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <DollarSign className="w-4 h-4" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="w-4 h-4" /> AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-600">Chart Type:</span>
              <Select value={revenueChartType} onValueChange={setRevenueChartType}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <RevenueChart invoices={filteredInvoices} chartType={revenueChartType} />
            <BudgetTrackingChart projects={filteredProjects} invoices={filteredInvoices} />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ProjectStatusChart projects={filteredProjects} />
              <CommunicationPatternsChart messages={filteredMessages} />
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <TeamUtilizationChart projects={filteredProjects} tasks={filteredTasks} />
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <ProposalDashboardPanel />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <InvoiceManager />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIInsightsPanel
              projects={filteredProjects}
              invoices={filteredInvoices}
              tasks={filteredTasks}
              milestones={filteredMilestones}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminRoute>
  );
}