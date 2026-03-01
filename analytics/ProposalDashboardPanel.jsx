import React, { useState } from "react";
import * as apiClient from "@/components/services/apiClient";
import * as functionsClient from "@/components/services/functionsClient";
import { config } from "@/components/utils/envConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Search, Eye, Send, CheckCircle, Clock, XCircle,
  DollarSign, Calendar, Mail, Loader2, Sparkles, Share2, Copy
} from "lucide-react";
import { format } from "date-fns";
import ProposalViewModal from "@/components/proposals/ProposalViewModal";
import AIProposalEditor from "@/components/proposals/AIProposalEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ProposalDashboardPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);
  const [proposalProjectFilter, setProposalProjectFilter] = useState("all");
  const [shareEmail, setShareEmail] = useState("");
  const [sharingProposalId, setSharingProposalId] = useState(null);
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => apiClient.list('Proposal', '-created_date', 100),
    initialData: []
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.list('Project', '-created_date', 100),
    initialData: []
  });

  const updateProposalMutation = useMutation({
    mutationFn: ({ id, updates }) => apiClient.update('Proposal', id, updates),
    onSuccess: () => { queryClient.invalidateQueries(['proposals']); }
  });

  const sendProposalMutation = useMutation({
    mutationFn: async ({ id, data, proposal }) => {
      const updatedProposal = await apiClient.update('Proposal', id, { ...data, status: 'sent', sent_date: new Date().toISOString() });
      if (data.recipient_emails && data.recipient_emails.length > 0) {
        for (const email of data.recipient_emails) {
          try {
            const prospects = await apiClient.filter('Prospect', { contact_email: email });
            if (prospects && prospects.length > 0) {
              await apiClient.update('Prospect', prospects[0].id, { status: "Proposal Sent", deal_stage: "Proposal" });
            }
          } catch (error) { console.error("Error updating prospect status:", error); }
        }
      }
      return updatedProposal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      setEditingProposal(null);
    }
  });

  const handleSaveProposal = (proposalData) => {
    if (editingProposal?.id) updateProposalMutation.mutate({ id: editingProposal.id, data: proposalData });
  };

  const handleSendProposal = (proposalData) => {
    if (editingProposal?.id) sendProposalMutation.mutate({ id: editingProposal.id, data: proposalData, proposal: editingProposal });
  };

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.proposal_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === "draft").length,
    sent: proposals.filter(p => p.status === "sent" || p.status === "viewed").length,
    signed: proposals.filter(p => p.status === "signed").length,
    totalValue: proposals.reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  const statusColors = { draft: "bg-gray-100 text-gray-700", sent: "bg-blue-100 text-blue-700", viewed: "bg-cyan-100 text-cyan-700", signed: "bg-green-100 text-green-700", declined: "bg-red-100 text-red-700", expired: "bg-orange-100 text-orange-700" };
  const statusIcons = { draft: Clock, sent: Send, viewed: Eye, signed: CheckCircle, declined: XCircle, expired: Clock };
  const getProjectName = (projectId) => { const project = projects.find(p => p.id === projectId); return project?.project_name || "Unknown Project"; };

  if (editingProposal) {
    return (
      <div>
        <Button variant="outline" onClick={() => setEditingProposal(null)} className="mb-4">← Back to List</Button>
        <AIProposalEditor proposal={editingProposal} onSave={handleSaveProposal} onSend={handleSendProposal} proposalCategory={editingProposal?.fields_data?.category || "General"} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <div className="flex items-center justify-between mb-3"><FileText className="w-8 h-8 opacity-80" /><span className="text-3xl font-bold">{stats.total}</span></div>
          <p className="text-sm opacity-90">Total Proposals</p>
        </Card>
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
          <div className="flex items-center justify-between mb-3"><Send className="w-8 h-8 opacity-80" /><span className="text-3xl font-bold">{stats.sent}</span></div>
          <p className="text-sm opacity-90">Sent & Active</p>
        </Card>
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between mb-3"><CheckCircle className="w-8 h-8 opacity-80" /><span className="text-3xl font-bold">{stats.signed}</span></div>
          <p className="text-sm opacity-90">Signed</p>
        </Card>
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between mb-3"><DollarSign className="w-8 h-8 opacity-80" /><span className="text-3xl font-bold">${(stats.totalValue / 1000).toFixed(0)}K</span></div>
          <p className="text-sm opacity-90">Total Value</p>
        </Card>
      </div>

      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="proposals">All Proposals</TabsTrigger>
          <TabsTrigger value="ai-generated"><Sparkles className="w-4 h-4 mr-2" />AI Generated</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals">
          <Card className="p-6 mb-6 border-0 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search proposals..." className="pl-10 h-12" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "sent", "viewed", "signed", "draft"].map(s => (
                  <Button key={s} variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-blue-600" : ""}>
                    {s.charAt(0).toUpperCase() + s.slice(1) === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1) + (s === "draft" ? "s" : "")}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>
          ) : filteredProposals.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-xl">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Proposals Found</h3>
              <p className="text-gray-600">{searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Start by creating a proposal template"}</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => {
                const StatusIcon = statusIcons[proposal.status] || FileText;
                return (
                  <Card key={proposal.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center"><FileText className="w-6 h-6 text-white" /></div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{proposal.title}</h3>
                            <p className="text-sm text-gray-600">{getProjectName(proposal.project_id)} • {proposal.proposal_number}</p>
                          </div>
                          <Badge className={statusColors[proposal.status]}><StatusIcon className="w-3 h-3 mr-1" />{proposal.status}</Badge>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          {proposal.amount && <div className="flex items-center gap-2 text-gray-600"><DollarSign className="w-4 h-4" /><span className="font-semibold text-gray-900">${proposal.amount.toLocaleString()}</span></div>}
                          {proposal.sent_date && <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" /><span>Sent {format(new Date(proposal.sent_date), 'MMM d, yyyy')}</span></div>}
                          {proposal.signed_date && <div className="flex items-center gap-2 text-gray-600"><CheckCircle className="w-4 h-4 text-green-600" /><span>Signed {format(new Date(proposal.signed_date), 'MMM d, yyyy')}</span></div>}
                          {proposal.recipient_emails?.length > 0 && <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /><span>{proposal.recipient_emails[0]}</span></div>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedProposal(proposal)}><Eye className="w-4 h-4 mr-1" />View</Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-generated">
          <Card className="p-6 border-0 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">AI-Generated Proposals</h3>
              <Badge className="bg-blue-100 text-blue-800"><Sparkles className="w-3 h-3 mr-1" />AI-Powered</Badge>
            </div>
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Filter by Project</Label>
              <Select value={proposalProjectFilter} onValueChange={setProposalProjectFilter}>
                <SelectTrigger><SelectValue placeholder="All Projects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => <SelectItem key={project.id} value={project.id}>{project.project_name} - {project.client_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              {proposals.filter(p => proposalProjectFilter === "all" || p.project_id === proposalProjectFilter).length === 0 ? (
                <div className="text-center py-12"><Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-600">No proposals generated yet</p></div>
              ) : (
                proposals.filter(p => proposalProjectFilter === "all" || p.project_id === proposalProjectFilter).map(proposal => (
                  <div key={proposal.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => setEditingProposal(proposal)}>
                        <h4 className="font-semibold text-gray-900 mb-1">{proposal.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{proposal.recipient_emails?.join(', ') || 'No recipients'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{format(new Date(proposal.created_date), 'MMM d, yyyy')}</span>
                          {proposal.sent_date && <span>• Sent {format(new Date(proposal.sent_date), 'MMM d')}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={statusColors[proposal.status]}>{proposal.status}</Badge>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); setEditingProposal(proposal); }} className="bg-blue-600 hover:bg-blue-700"><Eye className="w-3 h-3 mr-1" />Edit</Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSharingProposalId(proposal.id); }} className="text-purple-600 border-purple-600 hover:bg-purple-50"><Share2 className="w-3 h-3 mr-1" />Share</Button>
                      </div>
                    </div>
                    {sharingProposalId === proposal.id && (
                      <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200" onClick={(e) => e.stopPropagation()}>
                        <p className="text-sm font-medium text-gray-900 mb-3">Share Proposal</p>
                        <div className="flex gap-2 mb-2">
                          <Input type="email" placeholder="recipient@email.com" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="flex-1" />
                          <Button size="sm" onClick={async () => {
                            if (!shareEmail) return;
                            try {
                              await functionsClient.invoke('shareProposal', { proposalId: proposal.id, recipientEmail: shareEmail });
                              alert(`Proposal shared with ${shareEmail}`);
                              setShareEmail(""); setSharingProposalId(null);
                            } catch (error) { alert('Failed to share proposal: ' + error.message); }
                          }} className="bg-purple-600 hover:bg-purple-700"><Send className="w-3 h-3 mr-1" />Send</Button>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => {
                          const url = `${config.internalPortalUrl}/ProposalDashboard?id=${proposal.id}`;
                          navigator.clipboard.writeText(url); alert('Proposal link copied to clipboard!');
                        }} className="w-full"><Copy className="w-3 h-3 mr-1" />Copy Link</Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedProposal && (
        <ProposalViewModal proposal={selectedProposal} onClose={() => setSelectedProposal(null)} onUpdate={(updates) => { updateProposalMutation.mutate({ id: selectedProposal.id, updates }); setSelectedProposal(null); }} />
      )}
    </div>
  );
}