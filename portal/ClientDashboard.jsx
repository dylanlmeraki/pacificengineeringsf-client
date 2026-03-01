import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Download,
  ChevronRight,
  Target,
  GitPullRequest,
  DollarSign,
  Calendar,
  Activity,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  MessageSquare
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import ServiceRecommender from "./ServiceRecommender";

export default function ClientDashboard({ projects = [], pendingMilestones = [], pendingChangeOrders = [], recentDocuments = [], pendingProposals = [] }) {
  const activeProjects = projects.filter(p => p.status === "In Progress");
  const avgProgress = activeProjects.length > 0 
    ? Math.round(activeProjects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / activeProjects.length)
    : 0;

  const totalPendingApprovals = pendingMilestones.length + pendingChangeOrders.length;
  const totalOutstandingActions = totalPendingApprovals + pendingProposals.length;

  // Get upcoming milestones (next 30 days)
  const upcomingMilestones = [...pendingMilestones, ...projects.flatMap(p => p.milestones || [])]
    .filter(m => m.due_date && new Date(m.due_date) > new Date() && new Date(m.due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  // Fetch invoices for summary
  const { data: invoices = [] } = useQuery({
    queryKey: ['dashboard-invoices'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Invoice.filter({ client_email: user.email }, '-created_date', 50);
    }
  });

  // Fetch recent activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      const projectIds = projects.map(p => p.id);
      if (projectIds.length === 0) return [];
      
      const messages = await Promise.all(
        projectIds.map(id => base44.entities.ProjectMessage.filter({ project_id: id }, '-created_date', 10))
      );
      
      const allActivity = messages.flat().sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
      
      return allActivity.slice(0, 8);
    },
    enabled: projects.length > 0
  });

  // Invoice summary calculations
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const unpaidInvoices = invoices.filter(i => ['sent', 'viewed', 'overdue'].includes(i.status));
  const totalOwed = unpaidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const recentInvoices = invoices.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Outstanding Actions Banner */}
      {totalOutstandingActions > 0 && (
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Outstanding Actions: {totalOutstandingActions} Item{totalOutstandingActions === 1 ? '' : 's'} Require Attention
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                {pendingProposals.length > 0 && `${pendingProposals.length} proposal${pendingProposals.length > 1 ? 's' : ''}`}
                {pendingProposals.length > 0 && totalPendingApprovals > 0 && ', '}
                {pendingMilestones.length > 0 && `${pendingMilestones.length} milestone${pendingMilestones.length > 1 ? 's' : ''}`}
                {pendingMilestones.length > 0 && pendingChangeOrders.length > 0 && ' and '}
                {pendingChangeOrders.length > 0 && `${pendingChangeOrders.length} change order${pendingChangeOrders.length > 1 ? 's' : ''}`}
                {' '}awaiting your review.
              </p>
              <div className="flex gap-3 flex-wrap">
                {pendingMilestones.slice(0, 2).map(milestone => (
                  <Link key={milestone.id} to={`${createPageUrl("ProjectDetail")}?id=${milestone.project_id}`}>
                    <Button variant="outline" size="sm" className="bg-white">
                      <Target className="w-4 h-4 mr-2" />
                      Review {milestone.milestone_name}
                    </Button>
                  </Link>
                ))}
                {pendingChangeOrders.slice(0, 2).map(co => (
                  <Link key={co.id} to={`${createPageUrl("ProjectDetail")}?id=${co.project_id}`}>
                    <Button variant="outline" size="sm" className="bg-white">
                      <GitPullRequest className="w-4 h-4 mr-2" />
                      Review {co.title}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white hover:shadow-2xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 opacity-60" />
          </div>
          <div className="text-3xl font-bold mb-1">{activeProjects.length}</div>
          <div className="text-sm opacity-90 mb-3">Active Projects</div>
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-75">Avg Progress</span>
            <span className="font-bold">{avgProgress}%</span>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:shadow-2xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <BarChart3 className="w-5 h-5 opacity-60" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {projects.filter(p => p.status === "Completed").length}
          </div>
          <div className="text-sm opacity-90 mb-3">Completed</div>
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-75">Total</span>
            <span className="font-bold">{projects.length}</span>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-2xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <Sparkles className="w-5 h-5 opacity-60" />
          </div>
          <div className="text-3xl font-bold mb-1">{totalOutstandingActions}</div>
          <div className="text-sm opacity-90 mb-3">Action Required</div>
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-75">Approvals</span>
            <span className="font-bold">{totalPendingApprovals}</span>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-2xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <Calendar className="w-5 h-5 opacity-60" />
          </div>
          <div className="text-3xl font-bold mb-1">${totalOwed.toFixed(0)}</div>
          <div className="text-sm opacity-90 mb-3">Outstanding Balance</div>
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-75">Invoices</span>
            <span className="font-bold">{unpaidInvoices.length}</span>
          </div>
        </Card>
      </div>

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 border-l-4 border-purple-500">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Upcoming Milestones (Next 30 Days)
          </h3>
          <div className="space-y-3">
            {upcomingMilestones.map((milestone, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{milestone.milestone_name}</p>
                  {milestone.amount && (
                    <p className="text-xs text-gray-600">${milestone.amount.toLocaleString()}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {format(new Date(milestone.due_date), 'MMM d')}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Project Status Summary */}
      <Card className="p-6 border-0 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Project Status Summary</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {projects.filter(p => p.status === "Planning").length}
            </div>
            <div className="text-sm text-gray-600">Planning</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {projects.filter(p => p.status === "In Progress").length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {projects.filter(p => p.status === "Under Review").length}
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {projects.filter(p => p.status === "Completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Projects Summary */}
        <Card className="p-6 border-0 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Active Projects
            </h3>
            <Link to={createPageUrl("ClientPortal")}>
              <Button variant="outline" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No active projects</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeProjects.slice(0, 4).map(project => {
                const daysRemaining = project.estimated_completion 
                  ? differenceInDays(new Date(project.estimated_completion), new Date())
                  : null;
                
                return (
                  <Link key={project.id} to={`${createPageUrl("ProjectDetail")}?id=${project.id}`}>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-cyan-50 transition-all cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-md group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {project.project_name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                            <Badge variant="outline" className="text-xs">{project.project_type}</Badge>
                            <span>•</span>
                            <span className="font-mono">#{project.project_number}</span>
                            {daysRemaining !== null && (
                              <>
                                <span>•</span>
                                <span className={daysRemaining < 7 ? 'text-orange-600 font-semibold' : ''}>
                                  {daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-700 text-base font-bold">
                            {project.progress_percentage || 0}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={project.progress_percentage || 0} className="h-2.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="p-6 border-0 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activity
            </h3>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {recentActivity.map((activity, idx) => (
                <div key={activity.id} className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0">
                  <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-100 border-2 border-purple-500" />
                  <div className="text-xs text-gray-500 mb-1">
                    {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">
                    {activity.sender_name}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {activity.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Invoice Summary */}
      {invoices.length > 0 && (
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Invoice Summary
            </h3>
            <Link to={createPageUrl("ClientPortal")}>
              <Button variant="outline" size="sm">
                View All Invoices
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {overdueInvoices.length > 0 && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-semibold mb-1">
                <AlertCircle className="w-4 h-4" />
                {overdueInvoices.length} Overdue Invoice{overdueInvoices.length > 1 ? 's' : ''}
              </div>
              <p className="text-sm text-red-700">
                Please review and pay overdue invoices to avoid service interruption
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">${totalOwed.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Outstanding</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-orange-600">{unpaidInvoices.length}</div>
              <div className="text-sm text-gray-600">Unpaid Invoices</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-green-600">
                {invoices.filter(i => i.status === 'paid').length}
              </div>
              <div className="text-sm text-gray-600">Paid This Year</div>
            </div>
          </div>

          {recentInvoices.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-700 mb-2">Recent Invoices</div>
              {recentInvoices.map(invoice => {
                const statusColors = {
                  draft: "bg-gray-100 text-gray-700",
                  sent: "bg-blue-100 text-blue-700",
                  viewed: "bg-cyan-100 text-cyan-700",
                  paid: "bg-green-100 text-green-700",
                  overdue: "bg-red-100 text-red-700"
                };
                
                return (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm mb-1">
                        {invoice.invoice_number}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                        <span>•</span>
                        <span>Due {format(new Date(invoice.due_date), 'MMM d')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${invoice.total_amount.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* AI Service Recommendations */}
      <ServiceRecommender projects={projects} />

      {/* Recent Documents */}
      <Card className="p-6 border-0 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Documents</h3>
        </div>

        {recentDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No recent documents</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDocuments.slice(0, 5).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 text-sm truncate">{doc.document_name}</h5>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <Badge variant="outline" className="text-xs">{doc.document_type}</Badge>
                      <span>•</span>
                      <span>{format(new Date(doc.created_date), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}