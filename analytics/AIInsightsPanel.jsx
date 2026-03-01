import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function AIInsightsPanel({ projects = [], invoices = [], tasks = [], milestones = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState("");

  const generateInsights = async () => {
    setLoading(true);
    const summary = {
      total_projects: projects.length,
      active_projects: projects.filter((p) => p.status === "In Progress").length,
      completed_projects: projects.filter((p) => p.status === "Completed").length,
      total_budget: projects.reduce((s, p) => s + (p.budget || 0), 0),
      total_invoiced: invoices.reduce((s, i) => s + (i.total_amount || 0), 0),
      paid_invoices: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + (i.total_amount || 0), 0),
      overdue_invoices: invoices.filter((i) => i.status === "overdue").length,
      pending_tasks: tasks.filter((t) => t.status === "Pending").length,
      overdue_milestones: milestones.filter((m) => m.status !== "Completed" && m.due_date && new Date(m.due_date) < new Date()).length,
      project_types: projects.reduce((acc, p) => { acc[p.project_type || "Other"] = (acc[p.project_type || "Other"] || 0) + 1; return acc; }, {}),
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior construction project analytics advisor. Analyze this portfolio data and provide:
1. **Executive Summary** (2-3 sentences)
2. **Key Performance Insights** (3-4 bullet points)
3. **Financial Health Assessment** (2-3 bullet points)
4. **Risk Alerts** (2-3 items if any)
5. **Actionable Recommendations** (3-4 specific actions)

Portfolio Data:
${JSON.stringify(summary, null, 2)}

Be specific with numbers and percentages. Focus on actionable insights.`,
    });

    setInsights(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    setLoading(false);
  };

  return (
    <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI-Powered Insights
        </h3>
        <Button
          onClick={generateInsights}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {loading ? "Analyzing..." : "Generate Insights"}
        </Button>
      </div>
      {insights ? (
        <div className="prose prose-sm prose-slate max-w-none bg-white rounded-lg p-4 border">
          <ReactMarkdown>{insights}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-6 bg-white rounded-lg border">
          Click "Generate Insights" to get AI-powered portfolio analysis
        </div>
      )}
    </Card>
  );
}