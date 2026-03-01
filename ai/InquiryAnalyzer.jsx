import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, TrendingUp, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function InquiryAnalyzer({ contact, onAnalysisComplete }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeInquiry = async () => {
    try {
      setAnalyzing(true);
      const { data } = await base44.functions.invoke('analyzeContactInquiry', {
        contactId: contact.id
      });

      setAnalysis(data.analysis);
      toast.success("Analysis complete!");
      
      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze inquiry");
    } finally {
      setAnalyzing(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-blue-100 text-blue-700"
    };
    return colors[priority] || colors.low;
  };

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI Analysis</h3>
            <p className="text-sm text-gray-600">Intelligent inquiry insights</p>
          </div>
        </div>

        <Button
          onClick={analyzeInquiry}
          disabled={analyzing}
          className="bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-4">
          {/* Priority */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Priority Level</span>
            <Badge className={getPriorityColor(analysis.priority)}>
              {analysis.priority?.toUpperCase()}
            </Badge>
          </div>

          {/* Intent */}
          {analysis.intent && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Detected Intent</span>
              </div>
              <p className="text-sm text-gray-700">{analysis.intent}</p>
            </div>
          )}

          {/* Key Information */}
          {analysis.keyInfo && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">Key Information</span>
              </div>
              <ul className="space-y-1">
                {analysis.keyInfo.map((info, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    {info}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opportunities */}
          {analysis.opportunities && analysis.opportunities.length > 0 && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-900">Sales Opportunities</span>
              </div>
              <ul className="space-y-1">
                {analysis.opportunities.map((opp, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          {analysis.recommendedActions && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-gray-900">Recommended Actions</span>
              </div>
              <ul className="space-y-1">
                {analysis.recommendedActions.map((action, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estimated Value */}
          {analysis.estimatedValue && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-gray-700">Estimated Deal Value</span>
              <span className="text-lg font-bold text-green-600">
                ${analysis.estimatedValue.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}