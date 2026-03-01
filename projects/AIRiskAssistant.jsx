import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, TrendingUp, CheckCircle2, Loader2, Brain } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export default function AIRiskAssistant({ project, documents = [], milestones = [], messages = [] }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const hasProjectData = documents.length > 0 || milestones.length > 0 || messages.length > 0 || project.notes;

  const handleAnalyze = async () => {
    if (!hasProjectData) {
      alert("No project data available. Upload documents or add milestones to enable AI analysis.");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    try {
      // Gather all project context
      const projectContext = {
        project_name: project.project_name,
        project_type: project.project_type,
        status: project.status,
        progress: project.progress_percentage,
        start_date: project.start_date,
        estimated_completion: project.estimated_completion,
        budget: project.budget,
        description: project.description,
        notes: project.notes,
        team_size: project.assigned_team_members?.length || 0,
        documents_count: documents.length,
        milestones_total: milestones.length,
        milestones_completed: milestones.filter(m => m.status === "Completed").length,
        milestones_pending: milestones.filter(m => m.status === "Pending Client Approval").length,
        recent_messages: messages.slice(0, 5).map(m => ({
          sender: m.sender_name,
          date: m.created_date,
          preview: m.message.substring(0, 100)
        }))
      };

      const prompt = `You are an expert construction project manager and risk analyst. Analyze this project comprehensively and provide a detailed assessment.

PROJECT DATA:
${JSON.stringify(projectContext, null, 2)}

DOCUMENT TITLES:
${documents.map(d => `- ${d.document_name} (${d.document_type})`).join('\n')}

MILESTONE DETAILS:
${milestones.map(m => `- ${m.milestone_name}: ${m.status}, Due: ${m.due_date}, Progress: ${m.progress_percentage}%`).join('\n')}

Please analyze this project data and provide:

1. **Overall Health Score** (1-10)
2. **Progress Summary** - Current status and trajectory
3. **Identified Risks** - Specific risks with severity levels (High/Medium/Low)
4. **Timeline Analysis** - Are we on track? Any delays?
5. **Budget Considerations** - Financial health and concerns
6. **Recommendations** - Specific actionable steps to improve outcomes
7. **Red Flags** - Immediate attention items

Format your response in clear markdown with sections and bullet points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setAnalysis(response);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze project. Please try again.");
    }

    setAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Powered Risk Analysis
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              {hasProjectData 
                ? "Analyze project documents, milestones, and communications to identify risks and opportunities."
                : "Upload documents or add milestones to enable AI analysis."}
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !hasProjectData}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Project...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Project Health
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {analysis && (
        <Card className="p-8 border-0 shadow-xl">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI Analysis Results</h3>
                <p className="text-sm text-gray-600">Generated {format(new Date(), 'PPp')}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold text-gray-900 mb-3 mt-5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">{children}</h3>,
                strong: ({ children }) => {
                  const text = String(children);
                  if (text.includes('High')) {
                    return <strong className="text-red-600 font-bold">{children}</strong>;
                  } else if (text.includes('Medium')) {
                    return <strong className="text-orange-600 font-bold">{children}</strong>;
                  } else if (text.includes('Low')) {
                    return <strong className="text-yellow-600 font-bold">{children}</strong>;
                  }
                  return <strong className="text-gray-900 font-semibold">{children}</strong>;
                },
                ul: ({ children }) => <ul className="space-y-2 ml-4 my-3">{children}</ul>,
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  );
}