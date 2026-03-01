import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight, Lightbulb, RefreshCw } from "lucide-react";

const SERVICE_MAP = {
  "SWPPP": {
    related: ["QSD/QSP Services", "Environmental Monitoring", "Erosion Control"],
    description: "Based on your SWPPP projects, you may benefit from these complementary services."
  },
  "Construction": {
    related: ["Special Inspections", "Materials Testing", "Structural Engineering"],
    description: "Construction projects often pair well with inspection and testing services."
  },
  "Inspections": {
    related: ["SWPPP Compliance", "Materials Testing", "Quality Assurance"],
    description: "Enhance your inspection projects with compliance and testing services."
  },
  "Engineering": {
    related: ["Structural Analysis", "Geotechnical Services", "Construction Oversight"],
    description: "Engineering projects can benefit from expanded technical services."
  },
  "Special Inspections": {
    related: ["Materials Testing", "Structural Engineering", "Code Compliance"],
    description: "Special inspections complement well with testing and engineering services."
  },
  "Multiple Services": {
    related: ["Project Management", "Regulatory Consulting", "Comprehensive Reporting"],
    description: "Multi-service projects benefit from integrated management and consulting."
  }
};

export default function ServiceRecommender({ projects = [] }) {
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // Analyze project types
  const projectTypes = projects.map(p => p.project_type).filter(Boolean);
  const typeCounts = projectTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const staticRecs = topType && SERVICE_MAP[topType]
    ? SERVICE_MAP[topType]
    : { related: ["SWPPP Services", "Inspections & Testing", "Engineering"], description: "Explore our full range of engineering services." };

  const fetchAIRecommendations = async () => {
    setLoading(true);
    const projectSummary = projects.map(p => `${p.project_name} (${p.project_type}, ${p.status})`).join(", ");
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an engineering services consultant for Pacific Engineering SF, a firm specializing in SWPPP, construction, inspections, special inspections, and structural engineering.

Based on the client's projects: ${projectSummary}

Recommend 3 additional services that would complement their current work. For each service, provide:
1. Service name
2. A brief 1-sentence reason why it's relevant
3. Priority level (high/medium/low)

Be specific and practical.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service_name: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          }
        }
      }
    });

    setAiRecommendations(result.recommendations || []);
    setLoading(false);
  };

  if (projects.length === 0) return null;

  return (
    <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Recommended Services</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">{staticRecs.description}</p>

      <div className="space-y-2 mb-4">
        {staticRecs.related.map((service, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-800">{service}</span>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      {aiRecommendations ? (
        <div className="mt-4 pt-4 border-t border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-gray-900">AI Recommendations</span>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchAIRecommendations} disabled={loading}>
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="space-y-2">
            {aiRecommendations.map((rec, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">{rec.service_name}</span>
                  <Badge className={
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Button
          onClick={fetchAIRecommendations}
          disabled={loading}
          variant="outline"
          className="w-full mt-2 border-indigo-200 hover:bg-indigo-50"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2 text-purple-600" /> Get AI Recommendations</>
          )}
        </Button>
      )}
    </Card>
  );
}