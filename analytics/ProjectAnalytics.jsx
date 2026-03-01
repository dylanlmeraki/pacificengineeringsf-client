import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertCircle, Clock, CheckCircle, Activity } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProjectAnalytics({ projects = [], tasks = [] }) {
  const analytics = useMemo(() => {
    // Status distribution
    const statusDist = {
      planning: projects.filter(p => p.status === 'Planning').length,
      in_progress: projects.filter(p => p.status === 'In Progress').length,
      on_hold: projects.filter(p => p.status === 'On Hold').length,
      under_review: projects.filter(p => p.status === 'Under Review').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      closed: projects.filter(p => p.status === 'Closed').length
    };
    
    // Average progress
    const activeProjects = projects.filter(p => p.status === 'In Progress');
    const avgProgress = activeProjects.length > 0
      ? activeProjects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / activeProjects.length
      : 0;
    
    // Delay risk detection
    const atRisk = projects.filter(p => {
      if (p.status === 'Completed' || p.status === 'Closed') return false;
      const lastUpdate = new Date(p.updated_date);
      const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 7 || (p.progress_percentage < 50 && p.estimated_completion && new Date(p.estimated_completion) < new Date());
    });
    
    // Timeline burndown
    const burndown = activeProjects.map(p => ({
      name: p.project_name.substring(0, 20),
      progress: p.progress_percentage || 0,
      target: 100
    })).slice(0, 10);
    
    // Resource allocation heatmap data
    const resourceData = {};
    tasks.forEach(task => {
      if (task.assigned_to) {
        if (!resourceData[task.assigned_to]) {
          resourceData[task.assigned_to] = { total: 0, completed: 0, pending: 0 };
        }
        resourceData[task.assigned_to].total++;
        if (task.status === 'Completed') resourceData[task.assigned_to].completed++;
        else resourceData[task.assigned_to].pending++;
      }
    });
    
    const resourceAllocation = Object.entries(resourceData)
      .map(([user, data]) => ({
        user: user.split('@')[0],
        completed: data.completed,
        pending: data.pending,
        load: ((data.pending / (data.total || 1)) * 100).toFixed(0)
      }))
      .sort((a, b) => b.pending - a.pending)
      .slice(0, 10);
    
    return {
      statusDist,
      avgProgress: avgProgress.toFixed(1),
      atRisk,
      burndown,
      resourceAllocation,
      totalProjects: projects.length,
      activeProjects: activeProjects.length
    };
  }, [projects, tasks]);
  
  const statusData = [
    { name: 'Planning', value: analytics.statusDist.planning, color: '#6b7280' },
    { name: 'In Progress', value: analytics.statusDist.in_progress, color: '#3b82f6' },
    { name: 'On Hold', value: analytics.statusDist.on_hold, color: '#f59e0b' },
    { name: 'Under Review', value: analytics.statusDist.under_review, color: '#8b5cf6' },
    { name: 'Completed', value: analytics.statusDist.completed, color: '#10b981' },
    { name: 'Closed', value: analytics.statusDist.closed, color: '#6b7280' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.activeProjects}</h3>
          <p className="text-sm text-gray-600">Active Projects</p>
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <Badge className="bg-green-600 text-white">{analytics.avgProgress}%</Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Avg Progress</h3>
          <p className="text-sm text-gray-600">Across Active Projects</p>
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <Badge variant="outline" className="border-red-300 text-red-700">
              {analytics.atRisk.length}
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">At Risk</h3>
          <p className="text-sm text-gray-600">Delayed or Stale</p>
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-purple-600" />
            <span className="text-lg font-bold text-purple-600">
              {analytics.statusDist.completed}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Completed</h3>
          <p className="text-sm text-gray-600">This Period</p>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Project Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Resource Allocation */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Team Workload</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.resourceAllocation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      {/* Burn-down Chart */}
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Active Projects Progress</h3>
        <div className="space-y-4">
          {analytics.burndown.map((project, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{project.name}</span>
                <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </div>
          ))}
        </div>
      </Card>
      
      {/* At-Risk Projects */}
      {analytics.atRisk.length > 0 && (
        <Card className="p-6 border-2 border-red-300 bg-red-50 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">Projects at Risk</h3>
          </div>
          <div className="space-y-3">
            {analytics.atRisk.slice(0, 5).map((project, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{project.project_name}</h4>
                    <p className="text-sm text-gray-600">
                      Progress: {project.progress_percentage}% • 
                      Last updated: {new Date(project.updated_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-red-300 text-red-700">
                    Review Needed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}