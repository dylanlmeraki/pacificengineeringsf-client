import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  User,
  FileText,
  MessageSquare,
  Download,
  ArrowLeft,
  TrendingUp,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  Target,
  GitPullRequest,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DocumentUploader from "../components/portal/DocumentUploader";
import MessageThread from "../components/portal/MessageThread";
import ProposalBuilder from "../components/portal/ProposalBuilder";
import ProgressTracker from "../components/portal/ProgressTracker";
import MilestoneApproval from "../components/portal/MilestoneApproval";
import ChangeOrderApproval from "../components/portal/ChangeOrderApproval";
import CommentSection from "../components/portal/CommentSection";
import ClientTaskList from "../components/portal/ClientTaskList";
import DocumentAnnotator from "../components/portal/DocumentAnnotator";

export default function ProjectDetail() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const { data: documents = [], isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: async () => {
      return await base44.entities.ProjectDocument.filter(
        { project_id: projectId },
        '-created_date',
        100
      );
    },
    enabled: !!projectId
  });

  const { data: milestones = [], isLoading: milestonesLoading, refetch: refetchMilestones } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: async () => {
      return await base44.entities.ProjectMilestone.filter(
        { project_id: projectId },
        '-due_date',
        100
      );
    },
    enabled: !!projectId
  });

  const { data: changeOrders = [], isLoading: changeOrdersLoading, refetch: refetchChangeOrders } = useQuery({
    queryKey: ['project-change-orders', projectId],
    queryFn: async () => {
      return await base44.entities.ChangeOrder.filter(
        { project_id: projectId },
        '-created_date',
        100
      );
    },
    enabled: !!projectId
  });

  // Filter out internal comments for client view
  const isClient = user?.role !== 'admin';
  const clientVisibleDocuments = isClient ? documents : documents;
  const clientVisibleMilestones = isClient ? milestones : milestones;

  if (projectLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="p-12 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Link to={createPageUrl("ClientPortal")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusColors = {
    "Planning": "bg-gray-100 text-gray-700 border-gray-300",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
    "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-300",
    "Under Review": "bg-purple-100 text-purple-700 border-purple-300",
    "Completed": "bg-green-100 text-green-700 border-green-300",
    "Closed": "bg-gray-100 text-gray-500 border-gray-200"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to={createPageUrl("ClientPortal")} className="inline-flex items-center text-cyan-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{project.project_name}</h1>
              <p className="text-cyan-100 text-lg">Project #{project.project_number}</p>
            </div>
            <Badge className={`${statusColors[project.status]} border text-base px-4 py-2`}>
              {project.status}
            </Badge>
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="px-6 -mt-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 border-0 shadow-2xl bg-white">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Project Type</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{project.project_type}</p>
              </div>

              {project.location && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{project.location}</p>
                </div>
              )}

              {project.start_date && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Start Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(project.start_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}

              {project.estimated_completion && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Est. Completion</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(project.estimated_completion), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>

            {project.description && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Project Description</h3>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                <span className="text-2xl font-bold text-gray-900">{project.progress_percentage}%</span>
              </div>
              <Progress value={project.progress_percentage} className="h-3" />
            </div>
          </Card>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-5 mb-6 bg-white shadow-lg">
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents ({clientVisibleDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="milestones" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Milestones ({clientVisibleMilestones.filter(m => m.status === 'Pending Client Approval').length})
              </TabsTrigger>
              <TabsTrigger value="changeorders" className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4" />
                Change Orders ({changeOrders.filter(co => co.status === 'Pending Client Approval').length})
              </TabsTrigger>
            </TabsList>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <ClientTaskList projectId={projectId} user={user} />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <DocumentUploader projectId={projectId} onUploadComplete={refetchDocs} />

              <Card className="p-6 border-0 shadow-lg bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Project Documents</h3>
                
                {docsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : clientVisibleDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No documents uploaded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientVisibleDocuments.map((doc) => (
                      <Card key={doc.id} className="p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{doc.document_name}</h4>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <Badge variant="outline" className="text-xs">{doc.document_type}</Badge>
                                {doc.version && <span>v{doc.version}</span>}
                                <span>Uploaded {format(new Date(doc.created_date), 'MMM d, yyyy')}</span>
                                {doc.uploaded_by_name && <span>by {doc.uploaded_by_name}</span>}
                              </div>
                            </div>
                          </div>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                        <div className="space-y-4">
                          <DocumentAnnotator
                            document={doc}
                            project={project}
                            user={user}
                          />
                          <CommentSection 
                            entityType="document" 
                            entityId={doc.id} 
                            projectId={projectId} 
                            user={user}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Project Communication</h3>
                  <p className="text-sm text-gray-600">Chat with the Pacific Engineering team about this project</p>
                </div>
                <MessageThread projectId={projectId} />
              </Card>

              {user?.role === "admin" && (
                <>
                  <ProgressTracker milestones={milestones} />
                  <ProposalBuilder projectId={projectId} project={project} />
                </>
              )}
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-6">
              <Card className="p-6 border-0 shadow-lg bg-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Project Milestones</h3>
                    <p className="text-sm text-gray-600 mt-1">Review and approve project milestones</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                    {milestones.filter(m => m.status === 'Pending Client Approval').length} Pending
                  </Badge>
                </div>

                {milestonesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : clientVisibleMilestones.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No milestones defined yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {clientVisibleMilestones.map((milestone) => (
                      <div key={milestone.id} className="space-y-4">
                        <MilestoneApproval 
                          milestone={milestone}
                          onUpdate={refetchMilestones}
                        />
                        <div className="ml-8 pl-4 border-l-2 border-gray-200">
                          <CommentSection 
                            entityType="milestone" 
                            entityId={milestone.id} 
                            projectId={projectId} 
                            user={user}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Change Orders Tab */}
            <TabsContent value="changeorders" className="space-y-6">
              <Card className="p-6 border-0 shadow-lg bg-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Change Orders</h3>
                    <p className="text-sm text-gray-600 mt-1">Review and approve project changes</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                    {changeOrders.filter(co => co.status === 'Pending Client Approval').length} Pending
                  </Badge>
                </div>

                {changeOrdersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : changeOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <GitPullRequest className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No change orders submitted yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {changeOrders.map((changeOrder) => (
                      <ChangeOrderApproval 
                        key={changeOrder.id} 
                        changeOrder={changeOrder}
                        onUpdate={refetchChangeOrders}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}