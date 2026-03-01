import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  Target,
  FileText,
  Search,
  Sparkles,
  TrendingUp,
  Calendar,
  Building2,
  Activity,
  ArrowRight,
  Loader2,
  BarChart3,
  Mail,
  Clock
} from "lucide-react";
import AdminRoute from "../components/internal/AdminRoute";

import { format } from "date-fns";

export default function InternalDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: prospects = [], isLoading: prospectsLoading } = useQuery({
    queryKey: ['dashboard-prospects'],
    queryFn: () => base44.entities.Prospect.list('-created_date', 10),
    initialData: []
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 10),
    initialData: []
  });

  const { data: blogPosts = [], isLoading: blogLoading } = useQuery({
    queryKey: ['dashboard-blog'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 10),
    initialData: []
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => base44.entities.Task.filter({ status: "Pending" }, '-due_date', 10),
    initialData: []
  });

  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ['dashboard-audit'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 10),
    initialData: []
  });

  const quickActions = [
    {
      name: "Analytics",
      description: "View portfolio KPIs, charts & insights",
      icon: BarChart3,
      path: createPageUrl("AnalyticsDashboard"),
      color: "from-indigo-600 to-purple-600"
    },
    {
      name: "Manage Users",
      description: "Add, edit, or remove user accounts",
      icon: Users,
      path: createPageUrl("UserManagement"),
      color: "from-blue-600 to-cyan-600"
    },
    {
      name: "CRM Dashboard",
      description: "View and manage prospects & pipeline",
      icon: Target,
      path: createPageUrl("SalesDashboard"),
      color: "from-purple-600 to-indigo-600"
    },
    {
      name: "Workflows",
      description: "Automate project & CRM processes",
      icon: Activity,
      path: createPageUrl("WorkflowBuilder"),
      color: "from-pink-600 to-rose-600"
    },
    {
      name: "Create Blog Post",
      description: "Write and publish new content",
      icon: FileText,
      path: createPageUrl("BlogEditor"),
      color: "from-green-600 to-emerald-600"
    },
    {
      name: "SEO Analysis",
      description: "Optimize site performance",
      icon: Search,
      path: createPageUrl("SEOAssistant"),
      color: "from-orange-600 to-amber-600"
    },
    {
      name: "AI Prospecting",
      description: "Generate new leads automatically",
      icon: Sparkles,
      path: createPageUrl("SalesBotControl"),
      color: "from-pink-600 to-rose-600"
    },
    {
      name: "Client Projects",
      description: "View all active projects",
      icon: Building2,
      path: createPageUrl("ClientPortal"),
      color: "from-teal-600 to-cyan-600"
    },
    {
      name: "Email Templates",
      description: "Manage reusable email templates",
      icon: Mail,
      path: createPageUrl("EmailTemplates"),
      color: "from-indigo-600 to-blue-600"
    },
    {
      name: "Email Sequences",
      description: "Build multi-step outreach cadences",
      icon: BarChart3,
      path: createPageUrl("EmailSequences"),
      color: "from-emerald-600 to-teal-600"
    },
    {
      name: "Outreach Approvals",
      description: "Review and approve queued emails",
      icon: Clock,
      path: createPageUrl("OutreachQueue"),
      color: "from-orange-600 to-amber-600"
    }
  ];

  const stats = [
    {
      label: "Total Prospects",
      value: prospects.length,
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      label: "Active Projects",
      value: projects.filter(p => p.status === "In Progress").length,
      icon: Building2,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      label: "Published Posts",
      value: blogPosts.filter(p => p.published).length,
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
    {
      label: "Pending Tasks",
      value: tasks.length,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100"
    }
  ];

  return (
    <AdminRoute>
      
        <div className="py-6 lg:py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back{user ? `, ${user.full_name?.split(' ')[0]}` : ''}
            </h1>
            <p className="text-gray-600 text-lg">
              Your internal command center for Pacific Engineering operations
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.bg} rounded-lg p-3`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.name} to={action.path}>
                    <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      <div className="relative">
                        <div className={`bg-gradient-to-r ${action.color} rounded-lg w-12 h-12 flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {action.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                          Open <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </h3>
                <Link to={createPageUrl("UserManagement")}>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View All
                  </Button>
                </Link>
              </div>

              {auditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">
                          {log.actor_name} {log.action.replace(/_/g, ' ')}
                        </p>
                        {log.resource_name && (
                          <p className="text-xs text-gray-600">{log.resource_name}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(log.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Pending Tasks */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Pending Tasks
                </h3>
                <Link to={createPageUrl("SalesDashboard")}>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View All
                  </Button>
                </Link>
              </div>

              {tasksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending tasks
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          {task.prospect_name && (
                            <p className="text-xs text-gray-600">{task.prospect_name}</p>
                          )}
                        </div>
                        {task.due_date && (
                          <span className="text-xs text-orange-600 font-medium">
                            {format(new Date(task.due_date), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Recent Prospects & Blog Posts */}
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Recent Prospects
                </h3>
                <Link to={createPageUrl("SalesDashboard")}>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View CRM
                  </Button>
                </Link>
              </div>

              {prospectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : prospects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No prospects yet
                </div>
              ) : (
                <div className="space-y-3">
                  {prospects.slice(0, 5).map((prospect) => (
                    <div key={prospect.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{prospect.contact_name}</p>
                          <p className="text-xs text-gray-600">{prospect.company_name}</p>
                          <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded-full mt-1 inline-block">
                            {prospect.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Blog Posts
                </h3>
                <Link to={createPageUrl("BlogEditor")}>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    Manage Blog
                  </Button>
                </Link>
              </div>

              {blogLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No blog posts yet
                </div>
              ) : (
                <div className="space-y-3">
                  {blogPosts.slice(0, 5).map((post) => (
                    <div key={post.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-medium text-gray-900 text-sm">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.published 
                            ? "bg-green-600 text-white" 
                            : "bg-gray-300 text-gray-700"
                        }`}>
                          {post.published ? "Published" : "Draft"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(post.created_date), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      
    </AdminRoute>
  );
}