import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Settings } from "lucide-react";
import MetricsWidget from "../components/dashboard/widgets/MetricsWidget";
import StatusWidget from "../components/dashboard/widgets/StatusWidget";
import DeadlinesWidget from "../components/dashboard/widgets/DeadlinesWidget";
import RisksWidget from "../components/dashboard/widgets/RisksWidget";
import TaskSuggestions from "../components/projects/TaskSuggestions";
import WidgetCustomizer from "../components/dashboard/WidgetCustomizer";

const DEFAULT_WIDGETS = [
  { key: "metrics", visible: true, order: 0 },
  { key: "status", visible: true, order: 1 },
  { key: "deadlines", visible: true, order: 2 },
  { key: "risks", visible: true, order: 3 },
  { key: "task_suggestions", visible: true, order: 4 }
];

export default function ProjectDashboard() {
  const qc = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.filter({}, "-updated_date", 200),
  });

  const { data: docs = [] } = useQuery({
    queryKey: ["project_docs"],
    queryFn: () => base44.entities.ProjectDoc.filter({}, "-updated_date", 500),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks-list"],
    queryFn: () => base44.entities.Task.filter({}, "-updated_date", 500),
  });

  const { data: config } = useQuery({
    queryKey: ["dashboard_config"],
    queryFn: async () => {
      const list = await base44.entities.DashboardConfig.filter({ created_by: user?.email }, "-updated_date", 1);
      if (!list.length) {
        const created = await base44.entities.DashboardConfig.create({ widgets: DEFAULT_WIDGETS });
        return created;
      }
      return list[0];
    },
    enabled: !!user,
  });

  const updateConfig = useMutation({
    mutationFn: async (widgets) => {
      if (!config?.id) return base44.entities.DashboardConfig.create({ widgets });
      return base44.entities.DashboardConfig.update(config.id, { widgets });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard_config"] }),
  });

  const widgets = React.useMemo(() => {
    const w = (config?.widgets || DEFAULT_WIDGETS).slice().sort((a,b)=>a.order-b.order);
    return w.filter(x=>x.visible);
  }, [config]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-slate-600" />
            <h1 className="text-2xl font-semibold text-slate-900">Project Dashboard</h1>
          </div>
          <WidgetCustomizer
            current={config?.widgets || DEFAULT_WIDGETS}
            onChange={(next) => updateConfig.mutate(next)}
          >
            <Button variant="outline" className="gap-2"><Settings className="w-4 h-4"/> Customize</Button>
          </WidgetCustomizer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {widgets.map((w)=>{
            if (w.key === "metrics") return (
              <Card key={w.key}><CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader><CardContent>
                <MetricsWidget projects={projects} docs={docs} tasks={tasks} />
              </CardContent></Card>
            );
            if (w.key === "status") return (
              <Card key={w.key}><CardHeader><CardTitle>Project Status</CardTitle></CardHeader><CardContent>
                <StatusWidget projects={projects} />
              </CardContent></Card>
            );
            if (w.key === "deadlines") return (
              <Card key={w.key}><CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader><CardContent>
                <DeadlinesWidget docs={docs} tasks={tasks} />
              </CardContent></Card>
            );
            if (w.key === "risks") return (
              <Card key={w.key}><CardHeader><CardTitle>AI Risk Insights</CardTitle></CardHeader><CardContent>
                <RisksWidget projects={projects} docs={docs} />
              </CardContent></Card>
            );
            if (w.key === "task_suggestions") return (
              <Card key={w.key}><CardHeader><CardTitle>AI Task Suggestions</CardTitle></CardHeader><CardContent>
                <TaskSuggestions projects={projects} />
              </CardContent></Card>
            );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}