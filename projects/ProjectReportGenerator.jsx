import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Loader2, TrendingUp, Calendar, DollarSign, Users } from "lucide-react";
import { format } from "date-fns";

export default function ProjectReportGenerator({ clientName = "" }) {
  const [reportConfig, setReportConfig] = useState({
    reportType: "status",
    dateFrom: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
    projectType: "all",
    clientFilter: clientName || "",
    includeMetrics: {
      status: true,
      budget: true,
      timeline: true,
      team: true,
      documents: false,
      milestones: true
    }
  });

  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-reports'],
    queryFn: () => base44.entities.Project.list('-created_date', 500),
    initialData: []
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones-reports'],
    queryFn: () => base44.entities.ProjectMilestone.list('-created_date', 1000),
    initialData: []
  });

  const handleGenerateReport = async () => {
    setGenerating(true);
    setGeneratedReport(null);

    try {
      // Filter projects based on criteria
      let filteredProjects = projects.filter(p => {
        const createdDate = new Date(p.created_date);
        const matchesDate = createdDate >= new Date(reportConfig.dateFrom) && 
                           createdDate <= new Date(reportConfig.dateTo);
        const matchesType = reportConfig.projectType === "all" || p.project_type === reportConfig.projectType;
        const matchesClient = !reportConfig.clientFilter || 
                             p.client_name?.toLowerCase().includes(reportConfig.clientFilter.toLowerCase());
        return matchesDate && matchesType && matchesClient;
      });

      // Calculate metrics
      const totalProjects = filteredProjects.length;
      const completedProjects = filteredProjects.filter(p => p.status === "Completed").length;
      const activeProjects = filteredProjects.filter(p => p.status === "In Progress").length;
      const avgProgress = filteredProjects.length > 0
        ? Math.round(filteredProjects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / filteredProjects.length)
        : 0;

      const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const projectsByType = {};
      filteredProjects.forEach(p => {
        projectsByType[p.project_type] = (projectsByType[p.project_type] || 0) + 1;
      });

      const projectMilestones = milestones.filter(m => 
        filteredProjects.some(p => p.id === m.project_id)
      );
      const completedMilestones = projectMilestones.filter(m => m.status === "Completed").length;

      const report = {
        generatedAt: new Date().toISOString(),
        period: `${format(new Date(reportConfig.dateFrom), 'MMM d, yyyy')} - ${format(new Date(reportConfig.dateTo), 'MMM d, yyyy')}`,
        summary: {
          totalProjects,
          completedProjects,
          activeProjects,
          avgProgress,
          totalBudget,
          completedMilestones,
          totalMilestones: projectMilestones.length
        },
        projectsByType,
        projects: filteredProjects
      };

      setGeneratedReport(report);
    } catch (error) {
      console.error("Report generation error:", error);
      alert("Failed to generate report");
    }

    setGenerating(false);
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    const reportText = `
PROJECT REPORT
Generated: ${format(new Date(generatedReport.generatedAt), 'PPpp')}
Period: ${generatedReport.period}

SUMMARY
========
Total Projects: ${generatedReport.summary.totalProjects}
Completed: ${generatedReport.summary.completedProjects}
Active: ${generatedReport.summary.activeProjects}
Average Progress: ${generatedReport.summary.avgProgress}%
Total Budget: $${generatedReport.summary.totalBudget.toLocaleString()}
Completed Milestones: ${generatedReport.summary.completedMilestones} / ${generatedReport.summary.totalMilestones}

PROJECTS BY TYPE
================
${Object.entries(generatedReport.projectsByType).map(([type, count]) => `${type}: ${count}`).join('\n')}

DETAILED PROJECTS
=================
${generatedReport.projects.map(p => `
${p.project_name} (#${p.project_number})
Client: ${p.client_name}
Type: ${p.project_type}
Status: ${p.status}
Progress: ${p.progress_percentage}%
${p.budget ? `Budget: $${p.budget.toLocaleString()}` : ''}
`).join('\n---\n')}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Custom Report Generator
        </h3>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label>Report Type</Label>
            <Select value={reportConfig.reportType} onValueChange={(value) => setReportConfig({ ...reportConfig, reportType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Project Status Report</SelectItem>
                <SelectItem value="budget">Budget Analysis</SelectItem>
                <SelectItem value="team">Team Performance</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Project Type Filter</Label>
            <Select value={reportConfig.projectType} onValueChange={(value) => setReportConfig({ ...reportConfig, projectType: value })}>
              <SelectTrigger>
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
          </div>

          <div>
            <Label>Date From</Label>
            <Input
              type="date"
              value={reportConfig.dateFrom}
              onChange={(e) => setReportConfig({ ...reportConfig, dateFrom: e.target.value })}
            />
          </div>

          <div>
            <Label>Date To</Label>
            <Input
              type="date"
              value={reportConfig.dateTo}
              onChange={(e) => setReportConfig({ ...reportConfig, dateTo: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Client Filter (optional)</Label>
            <Input
              value={reportConfig.clientFilter}
              onChange={(e) => setReportConfig({ ...reportConfig, clientFilter: e.target.value })}
              placeholder="Filter by client name..."
            />
          </div>
        </div>

        <div className="mb-6">
          <Label className="mb-3 block">Include in Report</Label>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(reportConfig.includeMetrics).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => setReportConfig({
                    ...reportConfig,
                    includeMetrics: { ...reportConfig.includeMetrics, [key]: checked }
                  })}
                />
                <label htmlFor={key} className="text-sm capitalize cursor-pointer">
                  {key}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerateReport}
          disabled={generating}
          className="w-full bg-blue-600 hover:bg-blue-700 h-12"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </Card>

      {generatedReport && (
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Report Results</h3>
            <Button onClick={downloadReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Period:</span> {generatedReport.period}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Generated {format(new Date(generatedReport.generatedAt), 'PPpp')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{generatedReport.summary.totalProjects}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{generatedReport.summary.completedProjects}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">{generatedReport.summary.avgProgress}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                ${(generatedReport.summary.totalBudget / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Projects by Type</h4>
            {Object.entries(generatedReport.projectsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">{type}</span>
                <span className="font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}