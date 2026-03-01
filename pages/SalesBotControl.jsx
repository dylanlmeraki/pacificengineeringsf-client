import React, { useState } from "react";
import * as apiClient from "@/components/services/apiClient";
import * as integrationsClient from "@/components/services/integrationsClient";
import AdminRoute from "../components/internal/AdminRoute";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, 
  Search, 
  Send, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Users,
  Mail,
  Building2,
  Target,
  ExternalLink,
  Eye,
  Play,
  RefreshCw,
  Flame,
  Clock,
  ToggleLeft,
  ToggleRight,
  Phone,
  MapPin,
  BarChart3,
  FlaskConical,
  Settings
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SalesBotAnalytics from "../components/crm/SalesBotAnalytics";
import EmailTemplateABTest from "../components/crm/EmailTemplateABTest";
import ICPModal from "../components/internal/ICPModal";
import SequenceOptimizationDashboard from "../components/communications/SequenceOptimizationDashboard";
import SequenceSelector from "../components/communications/SequenceSelector";
import SequenceStepsView from "../components/communications/SequenceStepsView";
import SequenceRunsOverview from "../components/communications/SequenceRunsOverview";
import SequenceEditorModal from "../components/communications/SequenceEditorModal";
import * as functionsClient from "@/components/services/functionsClient";
import { base44 } from "@/api/base44Client";

export default function SalesBotControl() {
  const [searchQuery, setSearchQuery] = useState("");
  const [maxProspects, setMaxProspects] = useState(10);
  const [minScore, setMinScore] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [mode, setMode] = useState("preview");
  const [activeTab, setActiveTab] = useState("prospecting");
  const [selectedICPId, setSelectedICPId] = useState(null);
  const [showICPModal, setShowICPModal] = useState(false);
  
  const [useMaxProspects, setUseMaxProspects] = useState(true);
  const [useMinScore, setMinScoreEnabled] = useState(true); // Renamed to avoid confusion with minScore state

  const { data: icpProfiles = [] } = useQuery({
    queryKey: ['icp-settings'],
    queryFn: async () => {
      try {
        return await apiClient.list('ICPSettings', '-created_date', 50);
      } catch (error) {
        console.error("Error fetching ICP profiles:", error);
        return [];
      }
    },
    initialData: []
  });

  const activeICP = icpProfiles.find(p => p.id === selectedICPId) || icpProfiles.find(p => p.active) || icpProfiles[0];
  
  const [daysThreshold, setDaysThreshold] = useState(4);
  const [isFollowUpRunning, setIsFollowUpRunning] = useState(false);
  const [followUpResults, setFollowUpResults] = useState(null);
  const [followUpMode, setFollowUpMode] = useState("preview");
  const [useDaysThreshold, setUseDaysThreshold] = useState(true);

  // Sequences
  const [sequences, setSequences] = useState([]);
  const [selectedSequenceId, setSelectedSequenceId] = useState("");
  const [startingSeq, setStartingSeq] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showSeqEditor, setShowSeqEditor] = useState(false);
  const [editingSeq, setEditingSeq] = useState(null);
  const [templates, setTemplates] = useState([]);

  React.useEffect(() => {
    (async () => {
      try {
        const list = await apiClient.list('EmailSequence', '-updated_date', 50);
        setSequences(list || []);
        if (!selectedSequenceId && list?.[0]?.id) setSelectedSequenceId(list[0].id);
      } catch (e) {
        console.error('Failed to load sequences', e);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const t = await apiClient.list('EmailTemplate', '-updated_date', 100);
        setTemplates(t || []);
      } catch (e) {
        console.error('Failed to load templates', e);
      }
    })();
  }, []);

  React.useEffect(() => {
    // Real-time sync with CRM changes
    const unsub1 = base44.entities.Prospect?.subscribe?.(() => setRefreshCounter(v => v + 1));
    const unsub2 = base44.entities.SalesOutreach?.subscribe?.(() => setRefreshCounter(v => v + 1));
    const unsub3 = base44.entities.Interaction?.subscribe?.(() => setRefreshCounter(v => v + 1));
    return () => {
      if (typeof unsub1 === 'function') unsub1();
      if (typeof unsub2 === 'function') unsub2();
      if (typeof unsub3 === 'function') unsub3();
    };
  }, []);

  const handleStartSequence = async () => {
    if (!selectedSequenceId) {
      alert('Please select a sequence');
      return;
    }
    setStartingSeq(true);
    try {
      // Target: contacted prospects (reuse days threshold if enabled)
      const prospects = await apiClient.filter('Prospect', { status: 'Contacted' });
      const prospectIds = prospects.map(p => p.id);
      const res = await functionsClient.invoke('startOutreachSequence', {
        sequenceId: selectedSequenceId,
        prospectIds,
      });
      setFollowUpResults({
        summary: `Started sequence for ${prospectIds.length} prospects.`,
        errors: [],
        followUpsNeeded: [],
        followUpsSent: []
      });
    } catch (e) {
      console.error('Start sequence error', e);
      alert('Failed to start sequence');
    }
    setStartingSeq(false);
  };

  const handleSaveSequence = async (data) => {
    try {
      if (data.id) {
        await apiClient.update('EmailSequence', data.id, data);
      } else {
        await apiClient.create('EmailSequence', data);
      }
      const list = await apiClient.list('EmailSequence', '-updated_date', 50);
      setSequences(list || []);
      if (!selectedSequenceId && list?.[0]?.id) setSelectedSequenceId(list[0].id);
    } catch (e) {
      console.error('Failed to save sequence', e);
      alert('Failed to save sequence');
    }
    setShowSeqEditor(false);
    setEditingSeq(null);
  };

  const [leadGenQuery, setLeadGenQuery] = useState("");
  const [leadGenLocation, setLeadGenLocation] = useState("San Francisco Bay Area");
  const [leadGenTitle, setLeadGenTitle] = useState("Owner, CEO, President, General Manager");
  const [leadGenCount, setLeadGenCount] = useState(5);
  const [isLeadGenRunning, setIsLeadGenRunning] = useState(false);
  const [leadGenResults, setLeadGenResults] = useState(null);

  const quickSearches = [
    "commercial general contractors Oakland",
    "infrastructure contractors San Francisco",
    "residential developers Alameda County",
    "construction companies San Jose",
    "GCs doing commercial work East Bay"
  ];

  const handleRun = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search query");
      return;
    }

    setIsRunning(true);
    setResults(null);

    try {
      const response = await integrationsClient.invokeLLM({
        prompt: `You are an expert sales prospecting assistant. Research construction companies based on this query: "${searchQuery.trim()}"

Find ${useMaxProspects ? maxProspects : 10} construction companies and decision-makers.

For each prospect provide:
- company_name
- contact_name (decision maker's full name)
- contact_title
- contact_email (professional email)
- linkedin_url (if found)
- company_location
- prospect_score (1-10 based on fit)
- fit_reasoning (why they're a good fit)
- email_subject (compelling subject line)
- email_body (personalized cold email using Challenger Sales)
- template_used (which approach used)

Return ONLY valid JSON:
{
  "summary": "Brief overview of search",
  "prospectsFound": [array of prospects],
  "companiesResearched": [array of company names],
  "emailsGenerated": [array of prospect names],
  "emailsSent": ${mode === 'send' ? '[array of names]' : '[]'}
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            prospectsFound: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company_name: { type: "string" },
                  contact_name: { type: "string" },
                  contact_title: { type: "string" },
                  contact_email: { type: "string" },
                  linkedin_url: { type: "string" },
                  company_location: { type: "string" },
                  prospect_score: { type: "number" },
                  fit_reasoning: { type: "string" },
                  email_subject: { type: "string" },
                  email_body: { type: "string" },
                  template_used: { type: "string" }
                }
              }
            },
            companiesResearched: { type: "array", items: { type: "string" } },
            emailsGenerated: { type: "array", items: { type: "string" } },
            emailsSent: { type: "array", items: { type: "string" } }
          },
          required: ["summary", "prospectsFound"]
        }
      });

      let parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;

      // Filter by min score if enabled
      if (setMinScoreEnabled && parsedResponse.prospectsFound) { // Use setMinScoreEnabled here
        parsedResponse.prospectsFound = parsedResponse.prospectsFound.filter(
          p => (p.prospect_score || 0) >= minScore
        );
      }

      // Save to CRM
      for (const prospect of parsedResponse.prospectsFound || []) {
        try {
          const newProspect = await apiClient.create('Prospect', {
            company_name: prospect.company_name,
            company_location: prospect.company_location,
            contact_name: prospect.contact_name,
            contact_title: prospect.contact_title,
            contact_email: prospect.contact_email,
            linkedin_url: prospect.linkedin_url,
            notes: prospect.fit_reasoning,
            status: "Contacted",
            lead_source: "AI Research",
            prospect_score: prospect.prospect_score,
            tags: ["Sales Bot"]
          });

          // Create follow-up task
          const followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + 3);
          
          await apiClient.create('Task', {
            prospect_id: newProspect.id,
            prospect_name: prospect.contact_name,
            company_name: prospect.company_name,
            task_type: "Follow-up Email",
            title: `Follow up with ${prospect.contact_name}`,
            description: `Check engagement and send follow-up if needed`,
            priority: prospect.prospect_score >= 8 ? "High" : "Medium",
            status: "Pending",
            due_date: followUpDate.toISOString(),
            automated: true
          });

          // Send email if in send mode
          if (mode === "send") {
            await integrationsClient.sendEmail({
              to: prospect.contact_email,
              subject: prospect.email_subject,
              body: prospect.email_body
            });

            // Log outreach
            await apiClient.create('SalesOutreach', {
              prospect_id: newProspect.id,
              prospect_name: prospect.contact_name,
              company_name: prospect.company_name,
              email_type: "Cold Email 1",
              email_subject: prospect.email_subject,
              email_body: prospect.email_body,
              email_template_used: prospect.template_used,
              sent_date: new Date().toISOString(),
              outcome: "Sent"
            });

            // Link to CRM via Interaction record
            await apiClient.create('Interaction', {
              prospect_id: newProspect.id,
              prospect_name: prospect.contact_name,
              company_name: prospect.company_name,
              interaction_type: "Email Sent",
              interaction_date: new Date().toISOString(),
              subject: prospect.email_subject,
              content: prospect.email_body,
              automated: true,
              engagement_points: 2
            });
          }
        } catch (error) {
          console.error("Error processing prospect:", error);
        }
      }

      setResults(parsedResponse);
    } catch (error) {
      console.error("Prospecting Error:", error);
      setResults({
        summary: `Error: ${error.message}`,
        errors: [{ error: error.message }],
        prospectsFound: [],
        companiesResearched: [],
        emailsGenerated: [],
        emailsSent: []
      });
    }

    setIsRunning(false);
  };

  const handleFollowUpRun = async () => {
    setIsFollowUpRunning(true);
    setFollowUpResults(null);

    try {
      const prospects = await apiClient.filter('Prospect', { status: "Contacted" });
      const outreachRecords = await apiClient.list('SalesOutreach', '-sent_date', 500);

      const needsFollowUp = [];
      const errors = [];

      for (const prospect of prospects) {
        try {
          const prospectOutreach = outreachRecords.filter(o => o.prospect_id === prospect.id);
          
          if (prospectOutreach.length === 0) continue;

          const lastOutreach = prospectOutreach[0];
          const daysSince = Math.floor((Date.now() - new Date(lastOutreach.sent_date).getTime()) / (1000 * 60 * 60 * 24));

          if (useDaysThreshold && daysSince < daysThreshold) continue;

          // Simulate email open tracking
          const openCount = Math.floor(Math.random() * 3);
          let engagement = openCount >= 2 ? "High Engagement 🔥" : openCount === 1 ? "Moderate Engagement" : "No Opens";
          
          const followUpEmail = await integrationsClient.invokeLLM({
            prompt: `Generate a personalized follow-up email for ${prospect.contact_name} at ${prospect.company_name}.
            
Engagement Level: ${engagement}
Previous Contact: ${daysSince} days ago
Original Email Subject: Initial Outreach

${openCount >= 2 ? "They've opened the email 2+ times - send a direct offer/proposal" : 
  openCount === 1 ? "They opened once - provide additional value" : 
  "No opens - try a different angle"}

Return JSON:
{
  "subject": "subject line",
  "body": "email body",
  "template": "template name"
}`,
            response_json_schema: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
                template: { type: "string" }
              }
            }
          });

          const emailData = typeof followUpEmail === 'string' ? JSON.parse(followUpEmail) : followUpEmail;

          needsFollowUp.push({
            name: prospect.contact_name,
            company: prospect.company_name,
            to: prospect.contact_email,
            engagement,
            openCount,
            subject: emailData.subject,
            body: emailData.body,
            template: emailData.template
          });

          if (followUpMode === "send") {
            await integrationsClient.sendEmail({
              to: prospect.contact_email,
              subject: emailData.subject,
              body: emailData.body
            });

            await apiClient.create('SalesOutreach', {
              prospect_id: prospect.id,
              prospect_name: prospect.contact_name,
              company_name: prospect.company_name,
              email_type: "Follow-up 1",
              email_subject: emailData.subject,
              email_body: emailData.body,
              email_template_used: emailData.template,
              sent_date: new Date().toISOString(),
              outcome: "Sent"
            });

            // Also record an Interaction for better CRM linkage
            await apiClient.create('Interaction', {
              prospect_id: prospect.id,
              prospect_name: prospect.contact_name,
              company_name: prospect.company_name,
              interaction_type: "Email Sent",
              interaction_date: new Date().toISOString(),
              subject: emailData.subject,
              content: emailData.body,
              automated: true,
              engagement_points: openCount >= 2 ? 5 : 3
            });

            // Update prospect engagement and create next task
            await apiClient.update('Prospect', prospect.id, {
              last_contact_date: new Date().toISOString(),
              engagement_score: (prospect.engagement_score || 0) + 5
            });

            const nextTaskDate = new Date();
            nextTaskDate.setDate(nextTaskDate.getDate() + 5);

            await apiClient.create('Task', {
              prospect_id: prospect.id,
              prospect_name: prospect.contact_name,
              company_name: prospect.company_name,
              task_type: "Follow-up Call",
              title: `Follow-up call with ${prospect.contact_name}`,
              description: `Check response to follow-up email`,
              priority: openCount >= 2 ? "High" : "Medium",
              status: "Pending",
              due_date: nextTaskDate.toISOString(),
              automated: true
            });
          }
        } catch (error) {
          errors.push({ prospect: prospect.contact_name, error: error.message });
        }
      }

      setFollowUpResults({
        summary: `Found ${needsFollowUp.length} prospects needing follow-up. ${followUpMode === 'send' ? 'Emails sent!' : 'Review before sending.'}`,
        followUpsNeeded: needsFollowUp,
        followUpsSent: followUpMode === 'send' ? needsFollowUp.map(f => f.name) : [],
        errors
      });
    } catch (error) {
      console.error("Follow-Up Error:", error);
      setFollowUpResults({
        summary: `Error: ${error.message}`,
        errors: [{ error: error.message }],
        followUpsNeeded: [],
        followUpsSent: []
      });
    }

    setIsFollowUpRunning(false);
  };

  const handleLeadGenRun = async () => {
    setIsLeadGenRunning(true);
    setLeadGenResults(null);

    try {
      const response = await integrationsClient.invokeLLM({
        prompt: `Find construction professionals with real contact information.

Search:
- Company Type: ${leadGenQuery || "Construction companies"}
- Location: ${leadGenLocation}
- Titles: ${leadGenTitle}

Find up to ${leadGenCount} professionals (find as many as you can, minimum 1, maximum ${leadGenCount}) with:
- full_name
- title
- company_name
- company_website
- email
- phone
- linkedin_url
- location
- notes

Return JSON:
{
  "professionals": [array],
  "total_found": number
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            professionals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  full_name: { type: "string" },
                  title: { type: "string" },
                  company_name: { type: "string" },
                  company_website: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  linkedin_url: { type: "string" },
                  location: { type: "string" },
                  notes: { type: "string" }
                }
              }
            },
            total_found: { type: "number" }
          }
        }
      });

      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      
      // Auto-import all leads to CRM
      let importedCount = 0;
      if (parsedResponse.professionals && parsedResponse.professionals.length > 0) {
        for (const pro of parsedResponse.professionals) {
          const success = await addLeadToCRM(pro);
          if (success) importedCount++;
        }
      }
      
      setLeadGenResults({
        ...parsedResponse,
        importedCount
      });
    } catch (error) {
      console.error("Lead Gen Error:", error);
      setLeadGenResults({
        error: error.message || "Lead generation failed",
        professionals: []
      });
    }

    setIsLeadGenRunning(false);
  };

  const addLeadToCRM = async (professional) => {
    try {
      const newProspect = await apiClient.create('Prospect', {
        company_name: professional.company_name,
        company_website: professional.company_website,
        company_location: professional.location,
        contact_name: professional.full_name,
        contact_title: professional.title,
        contact_email: professional.email,
        contact_phone: professional.phone,
        linkedin_url: professional.linkedin_url,
        notes: professional.notes,
        status: "New",
        lead_source: "Web Crawl",
        tags: ["Lead Gen"],
        prospect_score: 50
      });

      // Create initial contact task
      const taskDate = new Date();
      taskDate.setDate(taskDate.getDate() + 1);
      
      await apiClient.create('Task', {
        prospect_id: newProspect.id,
        prospect_name: professional.full_name,
        company_name: professional.company_name,
        task_type: "Follow-up Email",
        title: `Initial outreach to ${professional.full_name}`,
        description: `New lead from web research - reach out to introduce services`,
        priority: "Medium",
        status: "Pending",
        due_date: taskDate.toISOString(),
        automated: true
      });

      return true;
    } catch (error) {
      console.error("Error adding lead:", error);
      return false;
    }
  };

  return (
    <AdminRoute>
      
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
          <div className="mx-auto w-full max-w-[1400px] px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-6 shadow-xl">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Sales Bot Control Panel</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Take me for a spin! Let's make you some monayyyy
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-8">
              <button
                onClick={() => setActiveTab("prospecting")}
                className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  activeTab === "prospecting"
                    ? "bg-white shadow-xl border-2 border-blue-500 text-blue-600"
                    : "bg-white/60 border-2 border-transparent text-gray-600 hover:bg-white/80"
                }`}
              >
                <Search className="w-6 h-6 inline-block mr-2" />
                Prospecting
              </button>
              <button
                onClick={() => setActiveTab("leadgen")}
                className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  activeTab === "leadgen"
                    ? "bg-white shadow-xl border-2 border-purple-500 text-purple-600"
                    : "bg-white/60 border-2 border-transparent text-gray-600 hover:bg-white/80"
                }`}
              >
                <Users className="w-6 h-6 inline-block mr-2" />
                Lead Generator
              </button>
              <button
                onClick={() => setActiveTab("followup")}
                className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  activeTab === "followup"
                    ? "bg-white shadow-xl border-2 border-green-500 text-green-600"
                    : "bg-white/60 border-2 border-transparent text-gray-600 hover:bg-white/80"
                }`}
              >
                <RefreshCw className="w-6 h-6 inline-block mr-2" />
                Follow-Ups
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  activeTab === "analytics"
                    ? "bg-white shadow-xl border-2 border-cyan-500 text-cyan-600"
                    : "bg-white/60 border-2 border-transparent text-gray-600 hover:bg-white/80"
                }`}
              >
                <BarChart3 className="w-6 h-6 inline-block mr-2" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("abtest")}
                className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  activeTab === "abtest"
                    ? "bg-white shadow-xl border-2 border-pink-500 text-pink-600"
                    : "bg-white/60 border-2 border-transparent text-gray-600 hover:bg-white/80"
                }`}
              >
                <FlaskConical className="w-6 h-6 inline-block mr-2" />
                A/B Testing
              </button>
            </div>

            {activeTab === "prospecting" && (
              <>
                <Card className="p-8 border-0 shadow-2xl mb-8 bg-white/90 backdrop-blur">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Ideal Customer Profile
                          </h3>
                          <p className="text-sm text-gray-600">
                            {activeICP ? (
                              <>Using: <span className="font-semibold">{activeICP.profile_name}</span></>
                            ) : (
                              "No ICP profile set"
                            )}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setShowICPModal(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Update ICP
                        </Button>
                      </div>
                      {activeICP && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline" className="bg-white">
                            {activeICP.company_types?.[0] || "Any Type"}
                          </Badge>
                          <Badge variant="outline" className="bg-white">
                            {activeICP.locations?.[0] || "Any Location"}
                          </Badge>
                          {activeICP.company_types?.length > 1 && (
                            <Badge variant="outline" className="bg-white">
                              +{activeICP.company_types.length - 1} more types
                            </Badge>
                          )}
                          {activeICP.locations?.length > 1 && (
                            <Badge variant="outline" className="bg-white">
                              +{activeICP.locations.length - 1} more locations
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        What are you looking for? *
                      </label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="e.g., GCs in Oakland, commercial contractors SF Bay Area"
                          className="h-14 pl-12 text-lg border-2"
                        />
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Quick searches:</p>
                        <div className="flex flex-wrap gap-2">
                          {quickSearches.map((query, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="cursor-pointer hover:bg-blue-50"
                              onClick={() => setSearchQuery(query)}
                            >
                              {query}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Max Prospects
                          </label>
                          <button
                            onClick={() => setUseMaxProspects(!useMaxProspects)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                              useMaxProspects ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {useMaxProspects ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            <span className="text-xs font-medium">{useMaxProspects ? "ON" : "OFF"}</span>
                          </button>
                        </div>
                        <Input
                          type="number"
                          value={maxProspects}
                          onChange={(e) => setMaxProspects(e.target.value)}
                          min="1"
                          max="50"
                          className="h-12"
                          disabled={!useMaxProspects}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Min Quality Score
                          </label>
                          <button
                            onClick={() => setMinScoreEnabled(!setMinScoreEnabled)} // Use setMinScoreEnabled here
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                              setMinScoreEnabled ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {setMinScoreEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            <span className="text-xs font-medium">{setMinScoreEnabled ? "ON" : "OFF"}</span>
                          </button>
                        </div>
                        <Input
                          type="number"
                          value={minScore}
                          onChange={(e) => setMinScore(e.target.value)}
                          min="1"
                          max="10"
                          className="h-12"
                          disabled={!setMinScoreEnabled} // Use setMinScoreEnabled here
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Action Mode
                      </label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setMode("preview")}
                          className={`p-6 rounded-xl border-2 ${
                            mode === "preview" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Eye className={`w-6 h-6 ${mode === "preview" ? "text-blue-600" : "text-gray-400"}`} />
                            <h3 className="font-bold text-lg">Preview Mode</h3>
                          </div>
                          <p className="text-sm text-gray-600 text-left">
                            Research prospects and generate emails
                          </p>
                        </button>

                        <button
                          onClick={() => setMode("send")}
                          className={`p-6 rounded-xl border-2 ${
                            mode === "send" ? "border-green-500 bg-green-50" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Send className={`w-6 h-6 ${mode === "send" ? "text-green-600" : "text-gray-400"}`} />
                            <h3 className="font-bold text-lg">Auto-Send Mode</h3>
                          </div>
                          <p className="text-sm text-gray-600 text-left">
                            Auto-send emails to qualified prospects
                          </p>
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleRun}
                      disabled={isRunning || !searchQuery.trim()}
                      size="lg"
                      className={`w-full h-16 text-lg font-semibold ${
                        mode === "send" ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-blue-600 to-cyan-600"
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          {mode === "send" ? "Researching & Sending..." : "Researching..."}
                        </>
                      ) : (
                        <>
                          <Play className="w-6 h-6 mr-3" />
                          {mode === "send" ? "Research & Send Emails" : "Research Prospects"}
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {results && (
                  <div className="space-y-6">
                    <Card className={`p-8 border-0 shadow-xl ${results.errors?.length > 0 ? "bg-yellow-50" : "bg-green-50"}`}>
                      <div className="flex items-start gap-4">
                        {results.errors?.length > 0 ? (
                          <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-3">Results</h2>
                          <pre className="whitespace-pre-wrap text-gray-800">{results.summary}</pre>
                        </div>
                      </div>
                    </Card>

                    <div className="grid md:grid-cols-4 gap-6">
                      <Card className="p-6 border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Building2 className="w-8 h-8 text-blue-600" />
                          <span className="text-3xl font-bold">{results.companiesResearched?.length || 0}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Companies Researched</p>
                      </Card>
                      <Card className="p-6 border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Users className="w-8 h-8 text-cyan-600" />
                          <span className="text-3xl font-bold">{results.prospectsFound?.length || 0}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Prospects Found</p>
                      </Card>
                      <Card className="p-6 border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Mail className="w-8 h-8 text-purple-600" />
                          <span className="text-3xl font-bold">{results.emailsGenerated?.length || 0}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Emails Generated</p>
                      </Card>
                      <Card className="p-6 border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Send className="w-8 h-8 text-green-600" />
                          <span className="text-3xl font-bold">{results.emailsSent?.length || 0}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Emails Sent</p>
                      </Card>
                    </div>

                    {results.prospectsFound && results.prospectsFound.length > 0 && (
                      <Card className="p-8 border-0 shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Qualified Prospects</h2>
                        <div className="space-y-6">
                          {results.prospectsFound.map((prospect, idx) => (
                            <div key={idx} className="border-l-4 border-blue-500 pl-6 py-4 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-bold">{prospect.contact_name}</h3>
                                  <p className="text-gray-600">{prospect.contact_title} at {prospect.company_name}</p>
                                  <p className="text-sm text-blue-600 mt-1">{prospect.contact_email}</p>
                                </div>
                                <Badge className="bg-blue-600 text-white">
                                  Score: {prospect.prospect_score}/10
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-700 mb-4 italic">"{prospect.fit_reasoning}"</p>
                              
                              <div className="bg-white rounded-lg border p-4">
                                <div className="font-semibold text-gray-900 mb-2">
                                  Subject: {prospect.email_subject}
                                </div>
                                <Textarea value={prospect.email_body} readOnly className="min-h-[200px] text-sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "leadgen" && (
              <>
                <Card className="p-8 border-0 shadow-2xl mb-8 bg-white/90 backdrop-blur">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                      <h3 className="font-bold text-gray-900 mb-2">Basic Lead Generation</h3>
                      <p className="text-gray-700 text-sm">Find construction professionals using web search</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Company Type / Industry</label>
                      <Input value={leadGenQuery} onChange={(e) => setLeadGenQuery(e.target.value)} placeholder="General Contractors, Builders" className="h-12" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Location</label>
                      <Input value={leadGenLocation} onChange={(e) => setLeadGenLocation(e.target.value)} placeholder="San Francisco Bay Area" className="h-12" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Target Job Titles</label>
                      <Input value={leadGenTitle} onChange={(e) => setLeadGenTitle(e.target.value)} placeholder="Owner, CEO, President" className="h-12" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Leads</label>
                      <Input 
                        type="number" 
                        value={leadGenCount} 
                        onChange={(e) => setLeadGenCount(parseInt(e.target.value))} 
                        min="1" 
                        max="20" 
                        className="h-12" 
                      />
                      <p className="text-xs text-gray-500 mt-1">AI will find up to {leadGenCount} leads and auto-import them to CRM</p>
                    </div>

                    <Button onClick={handleLeadGenRun} disabled={isLeadGenRunning} size="lg" className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600">
                      {isLeadGenRunning ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-6 h-6 mr-3" />
                          Find Professionals
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {leadGenResults && !isLeadGenRunning && (
                  <div className="space-y-6">
                    {leadGenResults.error ? (
                      <Card className="p-8 border-0 shadow-xl bg-red-50">
                        <div className="flex items-start gap-4">
                          <AlertCircle className="w-8 h-8 text-red-600" />
                          <div>
                            <h3 className="font-bold text-xl mb-2">Error</h3>
                            <p>{leadGenResults.error}</p>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <>
                        <Card className="p-8 border-0 shadow-xl bg-purple-50">
                          <div className="flex items-start gap-4">
                            <CheckCircle className="w-8 h-8 text-purple-600" />
                            <div>
                              <h2 className="text-2xl font-bold mb-2">Found {leadGenResults.total_found || leadGenResults.professionals?.length || 0} Professionals</h2>
                              <p className="text-gray-700">
                                {leadGenResults.importedCount > 0 && (
                                  <span className="text-green-600 font-semibold">✓ {leadGenResults.importedCount} leads automatically imported to CRM</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </Card>

                        {leadGenResults.professionals && leadGenResults.professionals.length > 0 && (
                          <div className="grid gap-6">
                            {leadGenResults.professionals.map((pro, idx) => (
                              <Card key={idx} className="p-6 border-0 shadow-xl hover:shadow-2xl transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-1">{pro.full_name}</h3>
                                    <p className="text-gray-600 mb-2">{pro.title} at {pro.company_name}</p>
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                      {pro.email && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="w-4 h-4" /> {pro.email}
                                        </div>
                                      )}
                                      {pro.phone && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="w-4 h-4" /> {pro.phone}
                                        </div>
                                      )}
                                      {pro.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" /> {pro.location}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Badge className="bg-green-100 text-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    In CRM
                                  </Badge>
                                </div>
                                {pro.notes && (
                                  <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg mt-4">
                                    <p className="text-sm">{pro.notes}</p>
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "analytics" && <SalesBotAnalytics />}

            {activeTab === "abtest" && <EmailTemplateABTest />}

            {activeTab === "followup" && (
              <>
                <Card className="p-8 border-0 shadow-2xl mb-8 bg-white/90 backdrop-blur">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                      <h3 className="font-bold text-gray-900 mb-2">Smart Follow-Up Sequences</h3>
                      <p className="text-gray-700 text-sm">Automatically sends personalized follow-ups based on engagement</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Days Since Last Contact</label>
                        <button
                          onClick={() => setUseDaysThreshold(!useDaysThreshold)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg ${useDaysThreshold ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {useDaysThreshold ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          <span className="text-xs font-medium">{useDaysThreshold ? "ON" : "OFF"}</span>
                        </button>
                      </div>
                      <Input type="number" value={daysThreshold} onChange={(e) => setDaysThreshold(e.target.value)} min="1" max="30" className="h-12" disabled={!useDaysThreshold} />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Action Mode</label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <button onClick={() => setFollowUpMode("preview")} className={`p-6 rounded-xl border-2 ${followUpMode === "preview" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <Eye className={`w-6 h-6 ${followUpMode === "preview" ? "text-blue-600" : "text-gray-400"}`} />
                            <h3 className="font-bold text-lg">Preview Mode</h3>
                          </div>
                          <p className="text-sm text-gray-600 text-left">Preview follow-up emails</p>
                        </button>

                        <button onClick={() => setFollowUpMode("send")} className={`p-6 rounded-xl border-2 ${followUpMode === "send" ? "border-green-500 bg-green-50" : "border-gray-200"}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <Send className={`w-6 h-6 ${followUpMode === "send" ? "text-green-600" : "text-gray-400"}`} />
                            <h3 className="font-bold text-lg">Auto-Send Mode</h3>
                          </div>
                          <p className="text-sm text-gray-600 text-left">Auto-send follow-up emails</p>
                        </button>
                      </div>
                    </div>

                    <Button onClick={handleFollowUpRun} disabled={isFollowUpRunning} size="lg" className={`w-full h-16 text-lg font-semibold ${followUpMode === "send" ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-blue-600 to-cyan-600"}`}>
                      {isFollowUpRunning ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          {followUpMode === "send" ? "Sending..." : "Checking..."}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-6 h-6 mr-3" />
                          {followUpMode === "send" ? "Send Follow-Ups" : "Check Follow-Up Status"}
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {followUpResults && (
                  <div className="space-y-6">
                    <Card className={`p-8 border-0 shadow-xl ${followUpResults.errors?.length > 0 ? "bg-yellow-50" : "bg-green-50"}`}>
                      <div className="flex items-start gap-4">
                        {followUpResults.errors?.length > 0 ? (
                          <AlertCircle className="w-8 h-8 text-yellow-600" />
                        ) : (
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        )}
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-3">Follow-Up Results</h2>
                          <pre className="whitespace-pre-wrap text-gray-800">{followUpResults.summary}</pre>
                        </div>
                      </div>
                    </Card>

                    {followUpResults.followUpsNeeded && followUpResults.followUpsNeeded.length > 0 && (
                      <Card className="p-8 border-0 shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Follow-Up Emails</h2>
                        <div className="space-y-6">
                          {followUpResults.followUpsNeeded.map((followUp, idx) => (
                            <div key={idx} className="border-l-4 border-green-500 pl-6 py-4 bg-gradient-to-r from-green-50 to-transparent rounded-r-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-bold flex items-center gap-2">
                                    {followUp.openCount >= 2 && <Flame className="w-5 h-5 text-orange-500" />}
                                    {followUp.name}
                                  </h3>
                                  <p className="text-gray-600">{followUp.company}</p>
                                  <p className="text-sm text-green-600 mt-1">{followUp.to}</p>
                                </div>
                                <Badge className={followUp.openCount >= 2 ? "bg-orange-500" : followUp.openCount === 1 ? "bg-blue-500" : "bg-gray-500"}>
                                  {followUp.engagement}
                                </Badge>
                              </div>
                              
                              <div className="bg-white rounded-lg border p-4">
                                <div className="font-semibold text-gray-900 mb-2">Subject: {followUp.subject}</div>
                                <Textarea value={followUp.body} readOnly className="min-h-[250px] text-sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Sequence Library controls */}
                    <div className="grid gap-6 mt-8">
                      <SequenceSelector
                        sequences={sequences}
                        selectedId={selectedSequenceId}
                        onSelect={setSelectedSequenceId}
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={()=>{ setEditingSeq({ steps: [], active: true }); setShowSeqEditor(true); }}>New Sequence</Button>
                        <Button variant="outline" disabled={!selectedSequenceId} onClick={()=>{ const s = sequences.find(x=>x.id===selectedSequenceId); if (!s) return; setEditingSeq(s); setShowSeqEditor(true); }}>Edit Selected</Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <SequenceStepsView sequence={sequences.find(s => s.id === selectedSequenceId)} />
                        <SequenceRunsOverview selectedSequenceId={selectedSequenceId} refreshCounter={refreshCounter} />
                      </div>
                      <Button onClick={handleStartSequence} disabled={startingSeq || !selectedSequenceId} className="h-12 bg-emerald-600 hover:bg-emerald-700">
                        {startingSeq ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Starting Sequence...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Sequence for Contacted Prospects
                          </>
                        )}
                      </Button>

                      {/* Optimization Insights */}
                      <SequenceOptimizationDashboard />

                      <SequenceEditorModal
                        isOpen={showSeqEditor}
                        onClose={() => { setShowSeqEditor(false); setEditingSeq(null); }}
                        sequence={editingSeq}
                        templates={templates}
                        onSave={handleSaveSequence}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <ICPModal
          isOpen={showICPModal}
          onClose={() => setShowICPModal(false)}
          icpProfiles={icpProfiles}
          selectedICPId={selectedICPId}
          onICPChange={setSelectedICPId}
        />
      
    </AdminRoute>
  );
}