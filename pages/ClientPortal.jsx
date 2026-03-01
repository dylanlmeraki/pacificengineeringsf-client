import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { getInternalPortalUrl, isClientPortal } from "@/components/utils/subdomainHelpers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FolderKanban, 
  Search, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  LayoutDashboard,
  Upload,
  FileText,
  MessageSquare,
  BarChart3,
  PlusCircle,
  Inbox,
  Download,
  User,
  RefreshCw
} from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary";
import ErrorDisplay from "../components/common/ErrorDisplay";
import { parseError, logError } from "../components/utils/errorHandler";
import { warn, error as logErrorMsg } from "../components/utils/logger";
import ProjectCard from "../components/portal/ProjectCard";
import ClientDashboard from "../components/portal/ClientDashboard";
import DocumentUploader from "../components/portal/DocumentUploader";
import MilestoneApproval from "../components/portal/MilestoneApproval";
import ChangeOrderApproval from "../components/portal/ChangeOrderApproval";
import ProposalsList from "../components/portal/ProposalsList";
import ClientProposalView from "../components/portal/ClientProposalView";
import DocumentsManager from "../components/portal/DocumentsManager";
import CommunicationHub from "../components/portal/CommunicationHub";
import ClientAnalytics from "../components/portal/ClientAnalytics";
import GlobalSearchBar from "../components/common/GlobalSearchBar";
import ProjectRequestForm from "../components/portal/ProjectRequestForm";
import ProjectProgressTracker from "../components/portal/ProjectProgressTracker";
import NotificationBell from "../components/portal/NotificationBell";
import MessageThread from "../components/portal/MessageThread";
import ClientRFISection from "../components/rfi/ClientRFISection";
import ContractsApprovals from "../components/portal/ContractsApprovals";
import ClientInvoices from "../components/portal/ClientInvoices";
import ClientProfileSettings from "../components/portal/ClientProfileSettings";
import SecureDocumentViewer from "../components/portal/SecureDocumentViewer";
import { format } from "date-fns";

export default function ClientPortal() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [viewingProposal, setViewingProposal] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setAuthLoading(true);
        setAuthError(null);
        
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          // Redirect to auth page if not authenticated
          const currentPath = window.location.pathname + window.location.search;
          base44.auth.redirectToLogin(currentPath);
          return;
        }
        
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        logError(error, { context: 'ClientPortal - fetchUser' });
        logErrorMsg("Failed to fetch user in ClientPortal", { error: error?.message });
        const parsed = parseError(error);
        
        if (parsed.statusCode === 401 || parsed.type === 'AUTH_ERROR') {
          const currentPath = window.location.pathname + window.location.search;
          base44.auth.redirectToLogin(currentPath);
        } else {
          setAuthError(parsed);
        }
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUser();
  }, []);

  const { data: projects = [], isLoading, error: projectsError, refetch: refetchProjects } = useQuery({
    queryKey: ['client-projects', user?.email],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await base44.entities.Project.filter(
          { client_email: user.email },
          '-created_date',
          100
        );
      } catch (error) {
        logError(error, { context: 'ClientPortal - fetchProjects', userEmail: user?.email });
        throw error;
      }
    },
    enabled: !!user,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  const { data: allMilestones = [] } = useQuery({
    queryKey: ['client-milestones', user?.email],
    queryFn: async () => {
      if (!user || projects.length === 0) return [];
      const projectIds = projects.map(p => p.id);
      const milestones = await Promise.all(
        projectIds.map(id => base44.entities.ProjectMilestone.filter({ project_id: id }))
      );
      return milestones.flat();
    },
    enabled: !!user && projects.length > 0
  });

  const { data: allChangeOrders = [] } = useQuery({
    queryKey: ['client-change-orders', user?.email],
    queryFn: async () => {
      if (!user || projects.length === 0) return [];
      const projectIds = projects.map(p => p.id);
      const orders = await Promise.all(
        projectIds.map(id => base44.entities.ChangeOrder.filter({ project_id: id }))
      );
      return orders.flat();
    },
    enabled: !!user && projects.length > 0
  });

  const { data: allDocuments = [] } = useQuery({
    queryKey: ['client-documents', user?.email],
    queryFn: async () => {
      if (!user || projects.length === 0) return [];
      const projectIds = projects.map(p => p.id);
      const docs = await Promise.all(
        projectIds.map(id => base44.entities.ProjectDocument.filter({ project_id: id }))
      );
      return docs.flat().sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user && projects.length > 0
  });

  const { data: clientProposals = [] } = useQuery({
    queryKey: ['client-proposals', user?.email],
    queryFn: async () => {
      if (!user || projects.length === 0) return [];
      const projectIds = projects.map(p => p.id);
      const proposals = await Promise.all(
        projectIds.map(id => base44.entities.Proposal.filter({ project_id: id }))
      );
      return proposals.flat().sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user && projects.length > 0
  });

  const { data: projectMessages = [] } = useQuery({
    queryKey: ['client-project-messages-analytics', user?.email],
    queryFn: async () => {
      if (!user || projects.length === 0) return [];
      const projectIds = projects.map(p => p.id);
      const messages = await Promise.all(
        projectIds.map(id => base44.entities.ProjectMessage.filter({ project_id: id }))
      );
      return messages.flat();
    },
    enabled: !!user && projects.length > 0
  });

  const { data: proposalMessages = [] } = useQuery({
    queryKey: ['client-proposal-messages-analytics', user?.email],
    queryFn: async () => {
      if (!user || projects.length === 0) return [];
      const projectIds = projects.map(p => p.id);
      const proposals = await Promise.all(
        projectIds.map(id => base44.entities.Proposal.filter({ project_id: id }))
      );
      const proposalIds = proposals.flat().map(p => p.id);
      if (proposalIds.length === 0) return [];
      const messages = await Promise.all(
        proposalIds.map(id => base44.entities.ProposalMessage.filter({ proposal_id: id }))
      );
      return messages.flat();
    },
    enabled: !!user && projects.length > 0
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ['my-project-requests', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.ProjectRequest.filter({ client_email: user.email }, '-created_date');
    },
    enabled: !!user
  });

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.project_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingMilestones = allMilestones.filter(m => m.status === "Pending Client Approval");
  const pendingChangeOrders = allChangeOrders.filter(co => co.status === "Pending Client Approval");
  const pendingProposals = clientProposals.filter(p => ['sent', 'viewed', 'awaiting_signature'].includes(p.status));

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "In Progress").length,
    completed: projects.filter(p => p.status === "Completed").length,
    pending: projects.filter(p => p.status === "Planning" || p.status === "Under Review").length
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Auth error state
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <ErrorDisplay 
          error={authError} 
          onRetry={() => window.location.reload()}
          showHomeButton={true}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your client portal.</p>
          <Button 
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  if (viewingProposal && selectedProposal) {
    return (
      <ClientProposalView
        proposal={selectedProposal}
        onClose={() => {
          setViewingProposal(false);
          setSelectedProposal(null);
        }}
        onBack={() => setViewingProposal(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-800 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Client Portal</h1>
                <p className="text-cyan-100">Welcome back, {user.full_name}</p>
              </div>
            </div>
            <NotificationBell user={user} />
          <div className="mt-6 max-w-3xl"><GlobalSearchBar portal="client" /></div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="px-6 -mt-8 mb-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
          <Card className="p-6 border-0 shadow-xl bg-white">
            <div className="flex items-center justify-between mb-2">
              <FolderKanban className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Projects</p>
          </Card>

          <Card className="p-6 border-0 shadow-xl bg-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.active}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Active Projects</p>
          </Card>

          <Card className="p-6 border-0 shadow-xl bg-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-cyan-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.completed}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
          </Card>

          <Card className="p-6 border-0 shadow-xl bg-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.pending}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Pending Review</p>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="dashboard" className="w-full">
            <div className="mb-8 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="dashboard" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="request" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">New Request</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="my-requests" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <Inbox className="w-4 h-4" />
                    <span className="hidden sm:inline">Requests ({myRequests.length})</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="analytics" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                 <TabsTrigger value="messages" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                   <MessageSquare className="w-4 h-4" />
                   <span className="hidden sm:inline">Messages</span>
                 </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                 <TabsTrigger value="rfis" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                   <FileText className="w-4 h-4" />
                   <span className="hidden sm:inline">RFIs</span>
                 </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                 <TabsTrigger value="projects" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                   <FolderKanban className="w-4 h-4" />
                   <span className="hidden sm:inline">Projects ({projects.length})</span>
                 </TabsTrigger>
                </TabsList>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="documents" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Documents ({allDocuments.length})</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="proposals" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Proposals ({clientProposals.length})</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="contracts" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Contracts</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="approvals" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Approvals ({pendingMilestones.length + pendingChangeOrders.length})</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="upload" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="invoices" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Invoices</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="profile" className="w-full flex items-center justify-center gap-2 h-12 bg-white shadow-md hover:shadow-lg transition-all">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <ClientDashboard 
                  projects={projects}
                  pendingMilestones={pendingMilestones}
                  pendingChangeOrders={pendingChangeOrders}
                  recentDocuments={allDocuments}
                  pendingProposals={pendingProposals}
                />
              )}
            </TabsContent>

            {/* New Request Tab */}
            <TabsContent value="request">
              <ProjectRequestForm 
                user={user} 
                onSuccess={() => {
                  alert("Project request submitted successfully! We'll review it and get back to you shortly.");
                }}
              />
            </TabsContent>

            {/* My Requests Tab */}
            <TabsContent value="my-requests">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : myRequests.length === 0 ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Yet</h3>
                  <p className="text-gray-600">You haven't submitted any project requests.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request) => {
                    const statusColors = {
                      "Pending Review": "bg-yellow-100 text-yellow-700",
                      "In Discussion": "bg-blue-100 text-blue-700",
                      "Approved": "bg-green-100 text-green-700",
                      "Declined": "bg-red-100 text-red-700",
                      "Converted to Project": "bg-purple-100 text-purple-700"
                    };
                    
                    return (
                      <Card key={request.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{request.request_title}</h3>
                              <Badge className={statusColors[request.status]}>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-3">{request.description}</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold">Type:</span> {request.project_type}
                          </div>
                          {request.location && (
                            <div>
                              <span className="font-semibold">Location:</span> {request.location}
                            </div>
                          )}
                          {request.budget_range && (
                            <div>
                              <span className="font-semibold">Budget:</span> {request.budget_range}
                            </div>
                          )}
                        </div>

                        {request.attachments?.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Attachments:</p>
                            <div className="flex gap-2 flex-wrap">
                              {request.attachments.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <Download className="w-3 h-3" />
                                  Attachment {idx + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            Submitted {format(new Date(request.created_date), 'MMM d, yyyy')}
                          </div>
                          {request.reviewed_date && (
                            <div className="text-xs text-gray-500">
                              Reviewed {format(new Date(request.reviewed_date), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <ClientAnalytics 
                projects={projects}
                documents={allDocuments}
                projectMessages={projectMessages}
                proposalMessages={proposalMessages}
                milestones={allMilestones}
                changeOrders={allChangeOrders}
              />
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <CommunicationHub user={user} projects={projects} />
            </TabsContent>

            {/* RFIs Tab */}
            <TabsContent value="rfis">
              <ClientRFISection user={user} />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-6">
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Secure Document Access</h3>
                    <p className="text-gray-600 mb-4">
                      View and download project documents securely. All downloads are logged for security.
                    </p>
                  </Card>
                  <SecureDocumentViewer documents={allDocuments} />
                </div>
              )}
            </TabsContent>

            {/* Proposals Tab */}
            <TabsContent value="proposals">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {pendingProposals.length > 0 && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-purple-600" />
                        Action Required
                      </h3>
                      <p className="text-gray-700 mb-4">
                        You have {pendingProposals.length} proposal{pendingProposals.length > 1 ? 's' : ''} awaiting your review
                      </p>
                    </div>
                  )}
                  <ProposalsList 
                    proposals={clientProposals} 
                    onViewProposal={(proposal) => {
                      setSelectedProposal(proposal);
                      setViewingProposal(true);
                    }} 
                  />
                </>
              )}
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              {/* Enhanced project view with progress tracking */}
              <Card className="p-6 border-0 shadow-lg bg-white mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search projects by name or number..."
                      className="pl-10 h-12"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      onClick={() => setStatusFilter("all")}
                      className={statusFilter === "all" ? "bg-blue-600" : ""}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "In Progress" ? "default" : "outline"}
                      onClick={() => setStatusFilter("In Progress")}
                      className={statusFilter === "In Progress" ? "bg-blue-600" : ""}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={statusFilter === "Planning" ? "default" : "outline"}
                      onClick={() => setStatusFilter("Planning")}
                      className={statusFilter === "Planning" ? "bg-blue-600" : ""}
                    >
                      Planning
                    </Button>
                    <Button
                      variant={statusFilter === "Completed" ? "default" : "outline"}
                      onClick={() => setStatusFilter("Completed")}
                      className={statusFilter === "Completed" ? "bg-blue-600" : ""}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
              </Card>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <Card className="p-12 text-center border-0 shadow-xl bg-white">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderKanban className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Projects Found</h3>
                  <p className="text-gray-600">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your filters or search query."
                      : "You don't have any projects yet. Contact us to get started!"}
                  </p>
                </Card>
              ) : (
                <div className="space-y-8">
                  {filteredProjects.map((project) => (
                    <div key={project.id}>
                      <ProjectProgressTracker 
                        project={project} 
                        milestones={allMilestones}
                      />
                      
                      {/* Project Communication Section */}
                      <Card className="p-6 border-0 shadow-xl mt-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          Project Communications
                        </h3>
                        <MessageThread projectId={project.id} />
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Contracts & Approvals Tab */}
            <TabsContent value="contracts">
              <ContractsApprovals user={user} projects={projects} />
            </TabsContent>

            {/* Approvals Tab */}
            <TabsContent value="approvals" className="space-y-6">
              {pendingMilestones.length === 0 && pendingChangeOrders.length === 0 ? (
                <Card className="p-12 text-center border-0 shadow-xl bg-white">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-600">You have no pending approvals at this time.</p>
                </Card>
              ) : (
                <>
                  {pendingMilestones.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Pending Milestones ({pendingMilestones.length})
                      </h3>
                      <div className="grid gap-4">
                        {pendingMilestones.map(milestone => (
                          <MilestoneApproval key={milestone.id} milestone={milestone} />
                        ))}
                      </div>
                    </div>
                  )}

                  {pendingChangeOrders.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Pending Change Orders ({pendingChangeOrders.length})
                      </h3>
                      <div className="grid gap-4">
                        {pendingChangeOrders.map(co => (
                          <ChangeOrderApproval key={co.id} changeOrder={co} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload">
              <div className="max-w-2xl">
                {projects.length === 0 ? (
                  <Card className="p-12 text-center border-0 shadow-xl bg-white">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Projects Yet</h3>
                    <p className="text-gray-600">You need an active project to upload documents.</p>
                  </Card>
                ) : (
                  <Card className="p-6 border-0 shadow-xl bg-white">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Select Project</h3>
                    <div className="space-y-3">
                      {projects.map(project => (
                        <details key={project.id} className="group">
                          <summary className="cursor-pointer list-none p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-blue-50 hover:to-cyan-50 transition-all border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-gray-900">{project.project_name}</h4>
                                <p className="text-sm text-gray-600">#{project.project_number}</p>
                              </div>
                              <Badge variant="outline">{project.status}</Badge>
                            </div>
                          </summary>
                          <div className="mt-4">
                            <DocumentUploader projectId={project.id} />
                          </div>
                        </details>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <ClientInvoices clientEmail={user?.email} />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <ClientProfileSettings 
                user={user} 
                onUpdate={async () => {
                  const updatedUser = await base44.auth.me();
                  setUser(updatedUser);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}