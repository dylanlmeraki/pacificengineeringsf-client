import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminRoute from "../components/internal/AdminRoute";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ProspectBulkBar from "../components/crm/ProspectBulkBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  Send, 
  Users, 
  TrendingUp, 
  Mail, 
  Calendar,
  Building2,
  Play,
  Loader2,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  Zap,
  ListTodo,
  MessageSquare,
  DollarSign,
  Percent,
  Flame,
  BarChart3,
  Settings,
  RefreshCw,
  Brain,
  Sparkles,
  AlertCircle
} from "lucide-react";
import ProspectDetailModal from "../components/crm/ProspectDetailModal";

import ProspectKanban from "../components/crm/ProspectKanban";
import SequenceLibraryModal from "../components/communications/SequenceLibraryModal";
import AIProspectorPanel from "../components/crm/AIProspectorPanel";
import { calculateLeadScore } from "@/components/utils/calculateLeadScore";
import ErrorDisplay from "../components/common/ErrorDisplay";
import { parseError, logError } from "../components/utils/errorHandler";
import { analyzeSequencePerformance } from "@/functions/analyzeSequencePerformance";
import { suggestProspectActions } from "@/functions/suggestProspectActions";

export default function SalesDashboard() {
  const [view, setView] = useState("kanban"); // kanban, list, analytics, ai-prospector, by-sequence
  const [showSeqLibrary, setShowSeqLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSegment, setFilterSegment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [optimizationInsights, setOptimizationInsights] = useState(null);
  const [selectedProspectIds, setSelectedProspectIds] = useState(new Set());
  const [filterOwner, setFilterOwner] = useState("all");
  const [sortField, setSortField] = useState("-updated_date");
  const [sortDir, setSortDir] = useState("desc");
  const queryClient = useQueryClient();

  // Fetch workflows for automation
  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      try {
        return await base44.entities.Workflow.list('-created_date', 50);
      } catch (error) {
        logError(error, { context: 'Loading workflows' });
        return [];
      }
    },
    initialData: [],
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  const { data: prospects = [], isLoading: loadingProspects, error: prospectsError, refetch: refetchProspects } = useQuery({
    queryKey: ['prospects'],
    queryFn: async () => {
      try {
        return await base44.entities.Prospect.list('-updated_date', 200);
      } catch (error) {
        logError(error, { context: 'Loading prospects' });
        throw error;
      }
    },
    initialData: [],
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  const { data: interactions = [], error: interactionsError } = useQuery({
    queryKey: ['interactions'],
    queryFn: async () => {
      try {
        return await base44.entities.Interaction.list('-interaction_date', 500);
      } catch (error) {
        logError(error, { context: 'Loading interactions' });
        return [];
      }
    },
    initialData: [],
    retry: 2
  });

  const { data: tasks = [], error: tasksError } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        return await base44.entities.Task.list('-due_date', 300);
      } catch (error) {
        logError(error, { context: 'Loading tasks' });
        return [];
      }
    },
    initialData: [],
    retry: 2
  });

  const { data: outreach = [], error: outreachError } = useQuery({
    queryKey: ['outreach'],
    queryFn: async () => {
      try {
        return await base44.entities.SalesOutreach.list('-sent_date', 500);
      } catch (error) {
        logError(error, { context: 'Loading outreach' });
        return [];
      }
    },
    initialData: [],
    retry: 2
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['sequence-runs'],
    queryFn: async () => {
      try { return await base44.entities.OutreachSequenceRun.list('-updated_date', 500); } catch { return []; }
    },
    initialData: [],
    retry: 2
  });

  const { data: allSequences = [] } = useQuery({
    queryKey: ['email-sequences'],
    queryFn: async () => { try { return await base44.entities.EmailSequence.list('-updated_date', 200); } catch { return []; } },
    initialData: [],
    retry: 2
  });

  // Auto-create tasks and run workflows
  const runAutomationMutation = useMutation({
    mutationFn: async () => {
      try {
        return { 
          tasksCreated: 0,
          workflows: [],
          summary: "Automation system ready"
        };
      } catch (error) {
        logError(error, { context: 'Running automation' });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error) => {
      logError(error, { context: 'Automation mutation failed' });
    }
  });

  const handleRunAutomation = async () => {
    setIsAutoRunning(true);
    try {
      const [perfRes, actionsRes] = await Promise.all([
        analyzeSequencePerformance({}),
        suggestProspectActions({})
      ]);
      setOptimizationInsights({ performance: perfRes?.data, actions: actionsRes?.data });
    } catch (error) {
      logError(error, { context: 'Sequence optimization run' });
    } finally {
      setIsAutoRunning(false);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['prospects'] });
    queryClient.invalidateQueries({ queryKey: ['interactions'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['outreach'] });
  };

  const ownerOptions = Array.from(new Set(prospects.map(p => p.assigned_to).filter(Boolean)));

  // Filter prospects
  const filteredProspects = prospects.filter(p => {
    const matchesSearch = !searchQuery || 
      p.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = filterSegment === "all" || p.segment === filterSegment;
    const matchesOwner = filterOwner === "all" || p.assigned_to === filterOwner;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    
    return matchesSearch && matchesSegment && matchesStatus && matchesOwner;
  });

  // Sort
  const sorters = {
    "-updated_date": (a,b)=> new Date(b.updated_date||0)-new Date(a.updated_date||0),
    "updated_date": (a,b)=> new Date(a.updated_date||0)-new Date(b.updated_date||0),
    "prospect_score": (a,b)=> (sortDir==='asc'?1:-1) * ((a.prospect_score||0)-(b.prospect_score||0)),
    "engagement_score": (a,b)=> (sortDir==='asc'?1:-1) * ((a.engagement_score||0)-(b.engagement_score||0)),
    "deal_value": (a,b)=> (sortDir==='asc'?1:-1) * ((a.deal_value||0)-(b.deal_value||0)),
    "probability": (a,b)=> (sortDir==='asc'?1:-1) * ((a.probability||0)-(b.probability||0))
  };
  const sortedProspects = [...filteredProspects].sort(sorters[sortField] || sorters["-updated_date"]);

  // Calculate stats
  const stats = {
    totalProspects: prospects.length,
    hotLeads: prospects.filter(p => p.segment === "Hot Lead" || p.engagement_score >= 70).length,
    activeTasks: tasks.filter(t => t.status === "Pending").length,
    meetingsScheduled: prospects.filter(p => p.status === "Meeting Scheduled").length,
    proposalsSent: prospects.filter(p => p.status === "Proposal Sent").length,
    totalPipeline: prospects.reduce((sum, p) => sum + (p.deal_value || 0), 0),
    weightedPipeline: prospects.reduce((sum, p) => sum + ((p.deal_value || 0) * (p.probability || 0) / 100), 0),
    avgEngagement: Math.round(prospects.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / prospects.length || 0)
  };

  const urgentTasks = tasks.filter(t => {
    if (t.status !== "Pending") return false;
    const dueDate = new Date(t.due_date);
    const now = new Date();
    const hoursDiff = (dueDate - now) / (1000 * 60 * 60);
    return hoursDiff < 24 && hoursDiff > 0;
  }).slice(0, 5);

  const statusColors = {
    "New": "bg-gray-100 text-gray-700",
    "Researched": "bg-gray-100 text-gray-700",
    "Contacted": "bg-blue-100 text-blue-700",
    "Engaged": "bg-cyan-100 text-cyan-700",
    "Qualified": "bg-emerald-100 text-emerald-700",
    "Meeting Scheduled": "bg-purple-100 text-purple-700",
    "Proposal Sent": "bg-yellow-100 text-yellow-700",
    "Negotiation": "bg-orange-100 text-orange-700",
    "Won": "bg-green-100 text-green-700",
    "Lost": "bg-red-100 text-red-700",
    "Nurture": "bg-pink-100 text-pink-700"
  };

  // Show error banner if any queries failed
  const hasErrors = prospectsError || interactionsError || tasksError || outreachError;

  return (
    <AdminRoute>
      
        <div className="py-6 lg:py-8">
          <div className="w-full px-0 lg:px-2 xl:px-4">
        {/* Error Banner */}
        {hasErrors && (
          <Card className="p-4 mb-6 border-0 shadow-xl bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Connection Issue</p>
                  <p className="text-sm text-red-700">Some data couldn't be loaded. Click Refresh to try again.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6" >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sales CRM</h1>
            <p className="text-lg text-gray-600">AI-powered pipeline management and automation</p>
          </div>
          
          <div className="flex gap-3">
            {/* New AI Prospector Button */}
            <Button
              onClick={() => setView("ai-prospector")}
              className={`${
                view === "ai-prospector" 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" 
                  : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              }`}
            >
              <Brain className="w-5 h-5 mr-2" />
              Auto-Prospector
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={() => setShowSeqLibrary(true)}
              variant="outline"
            >
              Sequences Library
            </Button>
            <Button
              onClick={() => setView('by-sequence')}
              variant={view==='by-sequence' ? 'default' : 'outline'}
            >
              View by Sequence
            </Button>

            <Button
              onClick={handleRunAutomation}
              disabled={isAutoRunning}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isAutoRunning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Optimize Sequences
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </Button>
          </div>
        </div>


         {/* Optimization Insights */}
        {optimizationInsights && (
          <Card className="p-6 mb-6 border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold text-gray-900">Sequence Optimization Insights</div>
              <Button variant="outline" size="sm" onClick={()=>setOptimizationInsights(null)}>Clear</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg border p-3">
                <div className="font-medium mb-1">Performance</div>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-auto">{JSON.stringify(optimizationInsights.performance || {}, null, 2)}</pre>
              </div>
              <div className="bg-white rounded-lg border p-3">
                <div className="font-medium mb-1">Recommended Actions</div>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-auto">{JSON.stringify(optimizationInsights.actions || {}, null, 2)}</pre>
              </div>
            </div>
          </Card>
        )}

        {/* Conditional rendering for AI Prospector Panel vs. main dashboard content */}
        {view === "ai-prospector" ? (
          <AIProspectorPanel
            onProspectsCreated={(newProspects) => {
              queryClient.invalidateQueries({ queryKey: ['prospects'] });
            }}
          />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.totalProspects}</p>
                    <p className="text-sm opacity-90">Total Prospects</p>
                  </div>
                </div>
                <div className="text-xs opacity-75">
                  {stats.hotLeads} hot leads • {stats.avgEngagement}% avg engagement
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Flame className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.hotLeads}</p>
                    <p className="text-sm opacity-90">Hot Leads</p>
                  </div>
                </div>
                <div className="text-xs opacity-75">
                  {stats.meetingsScheduled} meetings • {stats.proposalsSent} proposals
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <p className="text-3xl font-bold">${(stats.weightedPipeline / 1000).toFixed(0)}K</p>
                    <p className="text-sm opacity-90">Weighted Pipeline</p>
                  </div>
                </div>
                <div className="text-xs opacity-75">
                  ${(stats.totalPipeline / 1000).toFixed(0)}K total pipeline value
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                <div className="flex items-center justify-between mb-3">
                  <ListTodo className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.activeTasks}</p>
                    <p className="text-sm opacity-90">Active Tasks</p>
                  </div>
                </div>
                <div className="text-xs opacity-75">
                  {urgentTasks.length} due in 24 hours
                </div>
              </Card>
            </div>

            {/* Urgent Tasks Banner */}
            {urgentTasks.length > 0 && (
              <Card className="p-6 mb-8 border-0 shadow-xl bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-3">⚡ Urgent Tasks Due Today</h3>
                    <div className="space-y-2">
                      {urgentTasks.map(task => (
                        <div key={task.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                            <p className="text-xs text-gray-600">{task.company_name} • {task.task_type}</p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">{task.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Filters and View Toggle */}
            <Card className="p-6 mb-6 border-0 shadow-xl">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search prospects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12"
                  />
                </div>

                <Select value={filterSegment} onValueChange={setFilterSegment}>
                  <SelectTrigger className="w-[180px] h-12">
                    <SelectValue placeholder="All Segments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="Hot Lead">Hot Lead</SelectItem>
                    <SelectItem value="Warm Lead">Warm Lead</SelectItem>
                    <SelectItem value="Cold Lead">Cold Lead</SelectItem>
                    <SelectItem value="High Value">High Value</SelectItem>
                    <SelectItem value="Quick Win">Quick Win</SelectItem>
                    <SelectItem value="Long Term">Long Term</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] h-12">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Engaged">Engaged</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Meeting Scheduled">Meeting Scheduled</SelectItem>
                    <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterOwner} onValueChange={setFilterOwner}>
                  <SelectTrigger className="w-[180px] h-12">
                    <SelectValue placeholder="Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    {ownerOptions.map(o => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                  </SelectContent>
                </Select>

                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="w-[200px] h-12">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-updated_date">Recently Updated</SelectItem>
                    <SelectItem value="updated_date">Oldest Updated</SelectItem>
                    <SelectItem value="prospect_score">Prospect Score</SelectItem>
                    <SelectItem value="engagement_score">Engagement Score</SelectItem>
                    <SelectItem value="deal_value">Deal Value</SelectItem>
                    <SelectItem value="probability">Win Probability</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')}>
                  {sortDir==='asc'?'Asc':'Desc'}
                </Button>

                <div className="flex gap-2 border-l pl-4">
                  <Button
                    variant={view === "kanban" ? "default" : "outline"}
                    onClick={() => setView("kanban")}
                    size="sm"
                  >
                    Kanban
                  </Button>
                  <Button
                    variant={view === "list" ? "default" : "outline"}
                    onClick={() => setView("list")}
                    size="sm"
                  >
                    List
                  </Button>
                  <Button
                    variant={view === "analytics" ? "default" : "outline"}
                    onClick={() => setView("analytics")}
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Main Content */}
            {loadingProspects ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              </div>
            ) : filteredProspects.length === 0 ? (
              <Card className="p-12 text-center border-0 shadow-xl">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No prospects found. Adjust your filters or use the AI Prospector to find new leads.</p>
              </Card>
            ) : (
              <>
                {/* Kanban View */}
                {view === "kanban" && (
                  <ProspectKanban 
                    prospects={filteredProspects} 
                    onProspectClick={setSelectedProspect}
                  />
                )}

                {/* List View */}
                {view === "list" && (
                  <Card className="p-6 border-0 shadow-xl">
                    {selectedProspectIds.size > 0 && (
                      <ProspectBulkBar
                        selectedCount={selectedProspectIds.size}
                        owners={ownerOptions}
                        onClear={() => setSelectedProspectIds(new Set())}
                        onApply={async (patch) => {
                          const ids = Array.from(selectedProspectIds);
                          const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v));
                          await Promise.all(ids.map(id => base44.entities.Prospect.update(id, clean)));
                          setSelectedProspectIds(new Set());
                          queryClient.invalidateQueries({ queryKey: ['prospects'] });
                        }}
                      />
                    )}
                    <div className="space-y-3">
                      {sortedProspects.map((prospect) => (
                        <div 
                          key={prospect.id} 
                          className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer bg-white flex gap-3"
                          onClick={() => setSelectedProspect(prospect)}
                        >
                          <div className="pt-1">
                             <Checkbox
                               checked={selectedProspectIds.has(prospect.id)}
                               onCheckedChange={(c)=>{
                                 const next = new Set(selectedProspectIds);
                                 if (c) next.add(prospect.id); else next.delete(prospect.id);
                                 setSelectedProspectIds(next);
                               }}
                               onClick={(e)=>e.stopPropagation()}
                             />
                           </div>
                           <div className="flex items-start justify-between flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                  {prospect.engagement_score >= 60 && <Flame className="w-5 h-5 text-orange-500" />}
                                  {prospect.contact_name}
                                </h3>
                                <Badge className={statusColors[prospect.status] || "bg-gray-100 text-gray-700"}>
                                  {prospect.status}
                                </Badge>
                                {prospect.segment && (
                                  <Badge variant="outline">{prospect.segment}</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  <span>{prospect.company_name}</span>
                                </div>
                                {prospect.contact_title && (
                                  <span>• {prospect.contact_title}</span>
                                )}
                                {prospect.contact_email && (
                                  <a href={`mailto:${prospect.contact_email}`} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                    {prospect.contact_email}
                                  </a>
                                )}
                              </div>

                              {/* Score Bars */}
                              <div className="grid grid-cols-3 gap-4 mb-3">
                                <div>
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Overall</span>
                                    <span className="font-bold">{prospect.prospect_score || 0}</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600" style={{width: `${prospect.prospect_score || 0}%`}} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Fit</span>
                                    <span className="font-bold">{prospect.fit_score || 0}</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-600" style={{width: `${prospect.fit_score || 0}%`}} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Engagement</span>
                                    <span className="font-bold">{prospect.engagement_score || 0}</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-600" style={{width: `${prospect.engagement_score || 0}%`}} />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                {prospect.deal_value && (
                                  <div className="text-sm">
                                    <span className="text-gray-600">Deal Value:</span>
                                    <span className="font-bold text-green-700 ml-1">${prospect.deal_value.toLocaleString()}</span>
                                  </div>
                                )}
                                {prospect.probability !== undefined && (
                                  <div className="text-sm">
                                    <span className="text-gray-600">Win Probability:</span>
                                    <span className="font-bold text-blue-700 ml-1">{prospect.probability}%</span>
                                  </div>
                                )}
                                {prospect.last_contact_date && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>Last contact: {new Date(prospect.last_contact_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {prospect.linkedin_url && (
                              <a
                                href={prospect.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Analytics View */}
                {view === "analytics" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 border-0 shadow-xl">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg">Pipeline by Stage</h3>
                      <div className="space-y-3">
                        {["Contacted", "Engaged", "Qualified", "Meeting Scheduled", "Proposal Sent", "Negotiation"].map(stage => {
                          const count = prospects.filter(p => p.status === stage).length;
                          const value = prospects.filter(p => p.status === stage).reduce((sum, p) => sum + (p.deal_value || 0), 0);
                          const percentage = (count / prospects.length * 100) || 0;
                          
                          return (
                            <div key={stage}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{stage}</span>
                                <span className="font-bold text-gray-900">{count} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{width: `${percentage}%`}} />
                              </div>
                              {value > 0 && (
                                <div className="text-xs text-gray-600 mt-1">${value.toLocaleString()}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    <Card className="p-6 border-0 shadow-xl">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg">Segment Distribution</h3>
                      <div className="space-y-3">
                        {["Hot Lead", "Warm Lead", "High Value", "Quick Win", "Long Term"].map(segment => {
                          const count = prospects.filter(p => p.segment === segment).length;
                          const percentage = (count / prospects.length * 100) || 0;
                          const avgScore = prospects.filter(p => p.segment === segment).reduce((sum, p) => sum + (p.prospect_score || 0), 0) / count || 0;
                          
                          return (
                            <div key={segment}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{segment}</span>
                                <span className="font-bold text-gray-900">{count} • Avg {avgScore.toFixed(0)}</span>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{width: `${percentage}%`}} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    <Card className="p-6 border-0 shadow-xl">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg">Engagement Levels</h3>
                      <div className="space-y-3">
                        {[
                          { label: "Very High (80-100)", min: 80, max: 100 },
                          { label: "High (60-79)", min: 60, max: 79 },
                          { label: "Medium (40-59)", min: 40, max: 59 },
                          { label: "Low (20-39)", min: 20, max: 39 },
                          { label: "Very Low (0-19)", min: 0, max: 19 }
                        ].map(range => {
                          const count = prospects.filter(p => (p.engagement_score || 0) >= range.min && (p.engagement_score || 0) <= range.max).length;
                          const percentage = (count / prospects.length * 100) || 0;
                          
                          return (
                            <div key={range.label}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{range.label}</span>
                                <span className="font-bold text-gray-900">{count}</span>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{width: `${percentage}%`}} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    <Card className="p-6 border-0 shadow-xl">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg">Activity Summary</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                            <span className="text-gray-700">Total Interactions</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{interactions.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <span className="text-gray-700">Completed Tasks</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === "Completed").length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-6 h-6 text-orange-600" />
                            <span className="text-gray-700">Emails Sent</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{outreach.length}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* By Sequence View */}
                {view === 'by-sequence' && (
                  <Card className="p-6 border-0 shadow-xl">
                    <h3 className="font-bold text-gray-900 mb-4">Prospects by Sequence</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {allSequences.map(seq => {
                        const seqRuns = runs.filter(r => r.sequence_id === seq.id);
                        const prospectIds = new Set(seqRuns.map(r => r.prospect_id));
                        const seqProspects = prospects.filter(p => prospectIds.has(p.id));
                        return (
                          <div key={seq.id} className="border rounded-xl p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-semibold">{seq.sequence_name}</div>
                                <div className="text-xs text-gray-500">{seqProspects.length} prospect(s)</div>
                              </div>
                            </div>
                            <div className="space-y-1 max-h-48 overflow-auto">
                              {seqProspects.length === 0 ? (
                                <div className="text-sm text-gray-500">No prospects enrolled.</div>
                              ) : (
                                seqProspects.map(p => (
                                  <div key={p.id} className="text-sm text-gray-700">{p.contact_name} • {p.company_name}</div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
          )}

                {/* Sequences Library Modal */}
                <SequenceLibraryModal open={showSeqLibrary} onClose={()=>setShowSeqLibrary(false)} />

                {/* Prospect Detail Modal */}
                {selectedProspect && (
                  <ProspectDetailModal
                    prospect={selectedProspect}
                    onClose={() => setSelectedProspect(null)}
                  />
                )}
          </div>
        </div>
      </AdminRoute>
    );
  }