import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Bell, 
  Mail, 
  FileText, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Bot
} from "lucide-react";
import { format } from "date-fns";

export default function CommunicationHub({ user, projects = [] }) {
  const [filter, setFilter] = useState("all");

  // Fetch all notifications
  const { data: notifications = [], isLoading: loadingNotifications } = useQuery({
    queryKey: ['client-notifications', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Notification.filter(
        { recipient_email: user.email },
        '-created_date',
        100
      );
    },
    enabled: !!user
  });

  // Fetch all project messages
  const { data: projectMessages = [], isLoading: loadingProjectMessages } = useQuery({
    queryKey: ['client-project-messages', user?.email],
    queryFn: async () => {
      if (!user || projects.length === 0) return [];
      const projectIds = projects.map(p => p.id);
      const messages = await Promise.all(
        projectIds.map(id => base44.entities.ProjectMessage.filter({ project_id: id }, '-created_date'))
      );
      return messages.flat();
    },
    enabled: !!user && projects.length > 0
  });

  // Fetch all proposal messages
  const { data: proposalMessages = [], isLoading: loadingProposalMessages } = useQuery({
    queryKey: ['client-proposal-messages', user?.email],
    queryFn: async () => {
      if (!user || projects.length === 0) return [];
      const projectIds = projects.map(p => p.id);
      const proposals = await Promise.all(
        projectIds.map(id => base44.entities.Proposal.filter({ project_id: id }))
      );
      const proposalIds = proposals.flat().map(p => p.id);
      if (proposalIds.length === 0) return [];
      const messages = await Promise.all(
        proposalIds.map(id => base44.entities.ProposalMessage.filter({ proposal_id: id }, '-created_date'))
      );
      return messages.flat();
    },
    enabled: !!user && projects.length > 0
  });

  const isLoading = loadingNotifications || loadingProjectMessages || loadingProposalMessages;

  // Combine all communications
  const allCommunications = [
    ...notifications.map(n => ({ ...n, type: 'notification', date: n.created_date })),
    ...projectMessages.map(m => ({ ...m, type: 'project_message', date: m.created_date })),
    ...proposalMessages.map(m => ({ ...m, type: 'proposal_message', date: m.created_date }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter communications
  const filteredCommunications = filter === "all" 
    ? allCommunications 
    : allCommunications.filter(c => c.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch(type) {
      case 'notification': return Bell;
      case 'project_message': return MessageSquare;
      case 'proposal_message': return FileText;
      default: return Mail;
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.project_name || "Unknown Project";
  };

  const renderCommunication = (item) => {
    const Icon = getIcon(item.type);
    const isUnread = item.type === 'notification' && !item.read;
    const isFromClient = item.sender_email === user?.email;

    return (
      <Card 
        key={`${item.type}-${item.id}`} 
        className={`p-4 border-0 shadow-md hover:shadow-lg transition-all ${
          isUnread ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-white'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            item.type === 'notification' ? 'bg-orange-100' :
            isFromClient ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Icon className={`w-5 h-5 ${
              item.type === 'notification' ? 'text-orange-600' :
              isFromClient ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-gray-900">
                  {item.type === 'notification' ? item.title : 
                   item.type === 'project_message' ? `Project: ${getProjectName(item.project_id)}` :
                   'Proposal Discussion'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {item.sender_name && (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.sender_name}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {format(new Date(item.date), 'MMM d, h:mm a')}
                  </span>
                  {isUnread && (
                    <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                  )}
                </div>
              </div>

              <Badge variant="outline" className="text-xs">
                {item.type === 'notification' ? 'System' :
                 item.type === 'project_message' ? 'Project' : 'Proposal'}
              </Badge>
            </div>

            {/* Content */}
            <p className="text-gray-700 text-sm leading-relaxed mb-2">
              {item.message || item.title}
            </p>

            {/* Priority badge for notifications */}
            {item.type === 'notification' && item.priority && item.priority !== 'normal' && (
              <Badge className={
                item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }>
                {item.priority}
              </Badge>
            )}

            {/* Link for notifications */}
            {item.type === 'notification' && item.link && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600 text-sm mt-2"
                onClick={() => window.location.href = item.link}
              >
                View Details →
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between">
            <Bell className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">{unreadCount}</div>
              <div className="text-sm opacity-90">Unread</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <div className="flex items-center justify-between">
            <MessageSquare className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">{projectMessages.length}</div>
              <div className="text-sm opacity-90">Project Messages</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <FileText className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">{proposalMessages.length}</div>
              <div className="text-sm opacity-90">Proposal Messages</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <Mail className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">{allCommunications.length}</div>
              <div className="text-sm opacity-90">Total Messages</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-lg bg-white">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-blue-600" : ""}
          >
            All Messages
          </Button>
          <Button
            variant={filter === "notification" ? "default" : "outline"}
            onClick={() => setFilter("notification")}
            className={filter === "notification" ? "bg-blue-600" : ""}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications ({notifications.length})
          </Button>
          <Button
            variant={filter === "project_message" ? "default" : "outline"}
            onClick={() => setFilter("project_message")}
            className={filter === "project_message" ? "bg-blue-600" : ""}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Project Messages ({projectMessages.length})
          </Button>
          <Button
            variant={filter === "proposal_message" ? "default" : "outline"}
            onClick={() => setFilter("proposal_message")}
            className={filter === "proposal_message" ? "bg-blue-600" : ""}
          >
            <FileText className="w-4 h-4 mr-2" />
            Proposal Messages ({proposalMessages.length})
          </Button>
        </div>
      </Card>

      {/* Communications List */}
      {filteredCommunications.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-xl bg-white">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Messages</h3>
          <p className="text-gray-600">
            You don't have any {filter === "all" ? "" : filter.replace("_", " ")} messages yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCommunications.map(renderCommunication)}
        </div>
      )}
    </div>
  );
}