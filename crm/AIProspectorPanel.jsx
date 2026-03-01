import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Search,
  Loader2,
  CheckCircle,
  Building2,
  User,
  Mail,
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  FileText,
  Send,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AIProspectorPanel({ onProspectsCreated }) {
  const [searchMode, setSearchMode] = useState("guided"); // guided, custom, auto
  const [searchCriteria, setSearchCriteria] = useState({
    location: "San Francisco Bay Area",
    industry: "General Contractors",
    companySize: "50-200 employees",
    painPoint: "SWPPP compliance"
  });
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [createdProspects, setCreatedProspects] = useState([]);

  // Fetch ICP settings
  const { data: icpProfiles = [] } = useQuery({
    queryKey: ['icp-settings'],
    queryFn: () => base44.entities.ICPSettings.list('-created_date', 10),
    initialData: []
  });

  const activeICP = icpProfiles.find(p => p.active) || icpProfiles[0];

  const presetSearches = [
    {
      name: "High-Growth GCs",
      prompt: "Find 3-5 general contractors in the Bay Area with 50-200 employees that have won major projects in the last 3 months. Focus on companies with active SWPPP permit needs.",
      icon: "🏗️"
    },
    {
      name: "Residential Developers",
      prompt: "Find 3-5 residential developers in San Francisco and Oakland working on multi-family projects over $10M. Look for companies dealing with permit delays or compliance issues.",
      icon: "🏘️"
    },
    {
      name: "Infrastructure Specialists",
      prompt: "Find 3-5 infrastructure contractors in the Bay Area working on municipal or transportation projects. Target companies that need structural engineering or inspection services.",
      icon: "🛣️"
    },
    {
      name: "Compliance Strugglers",
      prompt: "Find 3-5 construction companies in the Bay Area that have recently had SWPPP violations or permit delays. Focus on companies that need expert compliance support.",
      icon: "⚠️"
    },
    {
      name: "New Market Entrants",
      prompt: "Find 3-5 construction companies that recently expanded into the Bay Area market and may need local regulatory expertise for SWPPP and permitting.",
      icon: "🌟"
    }
  ];

  const runAIProspecting = async (prompt) => {
    setIsSearching(true);
    setResults(null);
    setCreatedProspects([]);

    try {
      // Build ICP context from settings
      let icpContext = "";
      if (activeICP) {
        icpContext = `
        
IDEAL CUSTOMER PROFILE:
- Company Types: ${activeICP.company_types?.join(", ") || "Any"}
- Locations: ${activeICP.locations?.join(", ") || "Any"}
- Company Size: ${activeICP.company_size_min || "Any"} to ${activeICP.company_size_max || "Any"}
- Revenue Range: ${activeICP.revenue_min || "Any"} to ${activeICP.revenue_max || "Any"}
- Decision Maker Titles: ${activeICP.decision_maker_titles?.join(", ") || "Any"}
- Key Pain Points: ${activeICP.pain_points?.join(", ") || "General"}
- Industries: ${activeICP.industries?.join(", ") || "Any"}
`;
      }

      // Use LLM to research and find prospects
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI prospecting agent for Pacific Engineering, a construction engineering firm.
${icpContext}

${prompt}

For each prospect you find, provide detailed information in JSON format:
- company_name, company_type, company_website, company_location
- company_size (e.g., "51-200"), annual_revenue (e.g., "$10M-$50M")
- contact_name, contact_title, contact_email, contact_phone
- linkedin_url (if found)
- notes (detailed research: recent projects, pain points, growth signals)
- industry_focus (array: ["Commercial", "Residential", etc.])
- services_interested (array: ["SWPPP", "Engineering", etc.])
- tags (array: ["Active Project", "High Growth", etc.])
- deal_value (estimated project value in dollars)
- recommended_approach (specific strategy for this prospect)
- cold_email_draft (personalized email using Challenger Sales methodology)

Return a JSON object with:
{
  "prospects": [...array of prospect objects...],
  "search_summary": "Brief summary of what you found",
  "total_found": number,
  "quality_rating": "High/Medium/Low"
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            prospects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company_name: { type: "string" },
                  company_type: { type: "string" },
                  company_website: { type: "string" },
                  company_location: { type: "string" },
                  company_size: { type: "string" },
                  annual_revenue: { type: "string" },
                  contact_name: { type: "string" },
                  contact_title: { type: "string" },
                  contact_email: { type: "string" },
                  contact_phone: { type: "string" },
                  linkedin_url: { type: "string" },
                  notes: { type: "string" },
                  industry_focus: { type: "array", items: { type: "string" } },
                  services_interested: { type: "array", items: { type: "string" } },
                  tags: { type: "array", items: { type: "string" } },
                  deal_value: { type: "number" },
                  recommended_approach: { type: "string" },
                  cold_email_draft: { type: "string" }
                }
              }
            },
            search_summary: { type: "string" },
            total_found: { type: "number" },
            quality_rating: { type: "string" }
          }
        }
      });

      // Validate and parse LLM response
      try {
        if (typeof response === 'string') {
          const parsedResponse = JSON.parse(response);
          setResults(parsedResponse);
        } else {
          setResults(response);
        }
      } catch (jsonError) {
        console.error("Failed to parse LLM response as JSON:", jsonError);
        setResults({
          error: "AI Prospecting failed due to invalid LLM response format. Please try again or refine the prompt.",
          prospects: []
        });
      }

    } catch (error) {
      console.error("AI Prospecting Error:", error);
      setResults({
        error: error.message,
        prospects: []
      });
    }

    setIsSearching(false);
  };

  const createProspect = async (prospectData) => {
    try {
      // Create prospect record in CRM
      const prospectRecord = {
        company_name: prospectData.company_name,
        company_type: prospectData.company_type,
        company_website: prospectData.company_website,
        company_location: prospectData.company_location,
        company_size: prospectData.company_size,
        annual_revenue: prospectData.annual_revenue,
        contact_name: prospectData.contact_name,
        contact_title: prospectData.contact_title,
        contact_email: prospectData.contact_email,
        contact_phone: prospectData.contact_phone,
        linkedin_url: prospectData.linkedin_url,
        notes: prospectData.notes,
        status: "Researched",
        lead_source: "AI Research",
        industry_focus: prospectData.industry_focus || [],
        services_interested: prospectData.services_interested || [],
        tags: prospectData.tags || [],
        deal_value: prospectData.deal_value,
        prospect_score: 75,
        segment: "AI Generated"
      };
      
      const createdProspect = await base44.entities.Prospect.create(prospectRecord);
      console.log('Prospect created successfully:', createdProspect);
      
      // Auto-enrich the prospect in the background
      base44.functions.invoke('enrichProspect', { prospectId: createdProspect.id })
        .then(() => console.log('Prospect enriched successfully'))
        .catch(err => console.warn('Enrichment failed:', err.message));
      
      setCreatedProspects(prev => [...prev, createdProspect.id]);
      
      if (onProspectsCreated) {
        onProspectsCreated([createdProspect]);
      }
      
      return { success: true, prospect: createdProspect };
    } catch (error) {
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        console.error('Server Error:', error.response.status, error.response.data);
        throw new Error(`Failed to create prospect: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please try again.');
      } else if (error.message) {
        // Error with message
        console.error('Prospect creation error:', error.message);
        throw new Error(`Failed to create prospect: ${error.message}`);
      } else {
        // Unexpected error
        console.error('Unexpected error:', error);
        throw new Error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const createAllProspects = async () => {
    if (!results?.prospects) return;

    for (const prospectData of results.prospects) {
      await createProspect(prospectData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-8 bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-0 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8" />
              AI Lead Prospector
            </h2>
            <p className="text-purple-100 text-lg">
              Autonomous AI agent that finds and qualifies high-value construction leads matching your ICP
            </p>
          </div>
          <Sparkles className="w-12 h-12 opacity-50" />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Target className="w-6 h-6 mb-2" />
            <p className="text-sm font-medium">Smart Targeting</p>
            <p className="text-xs text-purple-100">Finds companies matching your ICP</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Search className="w-6 h-6 mb-2" />
            <p className="text-sm font-medium">Deep Research</p>
            <p className="text-xs text-purple-100">Identifies decision-makers & pain points</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Zap className="w-6 h-6 mb-2" />
            <p className="text-sm font-medium">Auto-Outreach</p>
            <p className="text-xs text-purple-100">Drafts personalized cold emails</p>
          </div>
        </div>
      </Card>

      {/* Search Mode Selection */}
      <Card className="p-6 border-0 shadow-xl">
        <div className="flex gap-3 mb-6">
          <Button
            variant={searchMode === "guided" ? "default" : "outline"}
            onClick={() => setSearchMode("guided")}
            className="flex-1"
          >
            Guided Search
          </Button>
          <Button
            variant={searchMode === "custom" ? "default" : "outline"}
            onClick={() => setSearchMode("custom")}
            className="flex-1"
          >
            Custom Prompt
          </Button>
        </div>

        {/* Guided Search */}
        {searchMode === "guided" && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900 text-xl mb-4">Preset Searches</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {presetSearches.map((preset, idx) => (
                <Card
                  key={idx}
                  className="p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => runAIProspecting(preset.prompt)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{preset.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-sm text-gray-600">{preset.prompt}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Custom Search */}
        {searchMode === "custom" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Custom Search Instructions
              </label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Example: Find 5 general contractors in Oakland working on residential projects over $5M who have had SWPPP compliance issues in the last 6 months..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <Button
              onClick={() => runAIProspecting(customPrompt)}
              disabled={!customPrompt || isSearching}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              <Search className="w-5 h-5 mr-2" />
              Start AI Prospecting
            </Button>
          </div>
        )}
      </Card>

      {/* Loading State */}
      {isSearching && (
        <Card className="p-12 border-0 shadow-xl text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">AI Agent Working...</h3>
          <p className="text-gray-600">
            Scanning the internet for prospects, identifying decision-makers, and performing deep research
          </p>
          <div className="flex items-center justify-center gap-8 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Searching databases
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Analyzing companies
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Qualifying leads
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {results && !isSearching && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-xl mb-2">Search Complete</h3>
                {results.search_summary && (
                  <p className="text-gray-700 mb-3">{results.search_summary}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <Badge className="bg-green-100 text-green-700">
                    {results.total_found || results.prospects?.length || 0} Prospects Found
                  </Badge>
                  {results.quality_rating && (
                    <Badge variant="outline">Quality: {results.quality_rating}</Badge>
                  )}
                </div>
              </div>
              {results.prospects?.length > 0 && (
                <Button
                  onClick={createAllProspects}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add All to CRM
                </Button>
              )}
            </div>
          </Card>

          {/* Prospect Cards */}
          {results.prospects && results.prospects.length > 0 ? (
            <div className="space-y-4">
              {results.prospects.map((prospect, idx) => (
                <Card key={idx} className="p-6 border-0 shadow-xl hover:shadow-2xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-xl">{prospect.contact_name}</h3>
                        {createdProspects.includes(prospect.contact_email) ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Added to CRM
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-gray-600 mb-1">{prospect.contact_title} at {prospect.company_name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {prospect.company_size}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {prospect.annual_revenue}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {prospect.contact_email}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => createProspect(prospect)}
                      disabled={createdProspects.includes(prospect.contact_email)}
                      variant={createdProspects.includes(prospect.contact_email) ? "outline" : "default"}
                    >
                      {createdProspects.includes(prospect.contact_email) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Added
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Add to CRM
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Tags */}
                  {prospect.tags && prospect.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prospect.tags.map((tag, tagIdx) => (
                        <Badge key={tagIdx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Research Notes */}
                  {prospect.notes && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Research Findings
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{prospect.notes}</p>
                    </div>
                  )}

                  {/* Recommended Approach */}
                  {prospect.recommended_approach && (
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        Recommended Approach
                      </h4>
                      <p className="text-sm text-gray-700">{prospect.recommended_approach}</p>
                    </div>
                  )}

                  {/* Cold Email Draft */}
                  {prospect.cold_email_draft && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Send className="w-4 h-4 text-gray-600" />
                        AI-Generated Cold Email
                      </h4>
                      <div className="bg-white border border-gray-200 rounded p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap">
                        {prospect.cold_email_draft}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : results.error ? (
            <Card className="p-8 border-0 shadow-xl bg-red-50 border-l-4 border-red-500">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 text-xl mb-2">Error</h3>
                  <p className="text-gray-700">{results.error}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center border-0 shadow-xl">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No prospects found matching the criteria. Try adjusting your search.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}