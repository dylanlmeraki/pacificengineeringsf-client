import React, { useState } from "react";
import * as integrationsClient from "@/components/services/integrationsClient";
import AdminRoute from "../components/internal/AdminRoute";
import * as functionsClient from "@/components/services/functionsClient";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Loader2, 
  CheckCircle,
  TrendingUp,
  FileText,
  Zap,
  Target,
  Gauge,
  Smartphone,
  AlertCircle,
  Copy,
  Sparkles
} from "lucide-react";

export default function SEOAssistant() {
  const [selectedPage, setSelectedPage] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const pages = [
    { value: "Home", label: "Home Page" },
    { value: "About", label: "About Us" },
    { value: "Services", label: "Services" },
    { value: "ServicesOverview", label: "Services Overview" },
    { value: "InspectionsTesting", label: "Inspections & Testing" },
    { value: "SpecialInspections", label: "Special Inspections" },
    { value: "StructuralEngineering", label: "Structural Engineering" },
    { value: "Construction", label: "Construction Services" },
    { value: "SWPPPChecker", label: "SWPPP Checker" },
    { value: "Contact", label: "Contact" },
    { value: "Blog", label: "Blog" },
    { value: "ProjectGallery", label: "Project Gallery" }
  ];

  const loadPageContent = async (pageName) => {
    if (!pageName) {
      setPageContent("");
      return;
    }
    
    setIsLoadingContent(true);
    try {
      const response = await functionsClient.invoke('extractPageContent', { pageName });
      setPageContent(response.data.pageContent);
    } catch (error) {
      console.error("Error loading page content:", error);
      alert("Failed to auto-load page content. You can paste manually.");
    }
    setIsLoadingContent(false);
  };

  const handleAnalyze = async () => {
    if (!selectedPage || !pageContent.trim()) return;

    setIsAnalyzing(true);

    try {
      const prompt = `You are an expert SEO consultant analyzing a webpage for Pacific Engineering, a construction and engineering services company in the San Francisco Bay Area.

PAGE: ${selectedPage}

CURRENT CONTENT SAMPLE:
${pageContent}

Provide a comprehensive SEO analysis with the following:

1. PRIMARY KEYWORDS (5-7 high-value keywords)
2. SECONDARY KEYWORDS (8-10 supporting keywords)
3. META TITLE (optimized, 50-60 characters, includes primary keyword)
4. META DESCRIPTION (compelling, 150-160 characters, includes call-to-action)
5. CONTENT OPTIMIZATION (3-4 specific recommendations)
6. PERFORMANCE IMPROVEMENTS (3-4 actionable items for speed and mobile)
7. TECHNICAL SEO (3-4 recommendations for schema, structure, etc.)

Format as JSON with this structure:
{
  "primaryKeywords": ["keyword1", "keyword2", ...],
  "secondaryKeywords": ["keyword1", "keyword2", ...],
  "metaTitle": "optimized title here",
  "metaDescription": "optimized description here",
  "contentOptimization": [
    {"recommendation": "...", "priority": "high|medium|low", "impact": "description"}
  ],
  "performanceImprovements": [
    {"recommendation": "...", "category": "speed|mobile", "difficulty": "easy|medium|hard"}
  ],
  "technicalSEO": [
    {"recommendation": "...", "type": "schema|structure|other"}
  ],
  "overallScore": 75,
  "summary": "2-3 sentence summary of current state and potential"
}`;

      const result = await integrationsClient.invokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            primaryKeywords: { type: "array", items: { type: "string" } },
            secondaryKeywords: { type: "array", items: { type: "string" } },
            metaTitle: { type: "string" },
            metaDescription: { type: "string" },
            contentOptimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  priority: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            performanceImprovements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  category: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            },
            technicalSEO: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  type: { type: "string" }
                }
              }
            },
            overallScore: { type: "number" },
            summary: { type: "string" }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing page:", error);
      alert("Failed to analyze page. Please try again.");
    }

    setIsAnalyzing(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getPriorityColor = (priority) => {
    if (priority === "high") return "bg-red-100 text-red-700";
    if (priority === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <AdminRoute>
      
        <div className="py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                SEO Assistant
              </h1>
              <p className="text-gray-600 text-lg">
                Optimize your pages for search engines with AI-powered recommendations
              </p>
            </div>

        {/* Analysis Input */}
        <Card className="p-8 border-0 shadow-2xl mb-8 bg-white/90 backdrop-blur">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Page to Analyze
              </label>
              <select
                value={selectedPage}
                onChange={(e) => {
                  setSelectedPage(e.target.value);
                  loadPageContent(e.target.value);
                }}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="">Choose a page...</option>
                {pages.map((page) => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </select>
              {isLoadingContent && (
                <div className="flex items-center gap-2 text-sm text-purple-600 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading page content...
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Page Content Sample (auto-loaded or paste manually)
              </label>
              <Textarea
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                placeholder="Select a page above to auto-load content, or paste manually..."
                className="min-h-[200px] border-2 border-gray-200 focus:border-purple-500"
                disabled={isLoadingContent}
              />
              <p className="text-xs text-gray-500 mt-2">
                {selectedPage ? "Content auto-loaded. You can edit before analyzing." : "Select a page to auto-load, or paste content manually."}
              </p>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedPage || !pageContent.trim()}
              size="lg"
              className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-3" />
                  Analyze Page SEO
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">SEO Health Score</h2>
                  <p className="text-purple-100">{analysis.summary}</p>
                </div>
                <div className={`text-6xl font-bold px-8 py-4 rounded-2xl ${getScoreColor(analysis.overallScore)} bg-white`}>
                  {analysis.overallScore}
                </div>
              </div>
            </Card>

            {/* Keywords Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-0 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Primary Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.primaryKeywords.map((keyword, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-700 px-3 py-1.5 text-sm">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-6 h-6 text-pink-600" />
                  <h3 className="text-xl font-bold text-gray-900">Secondary Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.secondaryKeywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="px-3 py-1.5 text-sm">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            {/* Meta Optimization */}
            <Card className="p-8 border-0 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Meta Tag Optimization</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Optimized Meta Title</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(analysis.metaTitle)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-gray-900 font-medium">{analysis.metaTitle}</p>
                    <p className="text-xs text-gray-500 mt-2">Length: {analysis.metaTitle.length} characters</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Optimized Meta Description</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(analysis.metaDescription)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-gray-900">{analysis.metaDescription}</p>
                    <p className="text-xs text-gray-500 mt-2">Length: {analysis.metaDescription.length} characters</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Content Optimization */}
            <Card className="p-8 border-0 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">Content Optimization</h3>
              </div>
              <div className="space-y-4">
                {analysis.contentOptimization.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority} priority
                      </Badge>
                    </div>
                    <p className="text-gray-900 font-semibold mb-2">{item.recommendation}</p>
                    <p className="text-sm text-gray-600">{item.impact}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Performance Improvements */}
            <Card className="p-8 border-0 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Gauge className="w-6 h-6 text-orange-600" />
                <h3 className="text-2xl font-bold text-gray-900">Performance & Mobile</h3>
              </div>
              <div className="space-y-4">
                {analysis.performanceImprovements.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                    <div className="flex items-center gap-3 mb-2">
                      {item.category === "mobile" ? (
                        <Smartphone className="w-5 h-5 text-orange-600" />
                      ) : (
                        <Zap className="w-5 h-5 text-orange-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {item.difficulty} difficulty
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-gray-900 font-semibold">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Technical SEO */}
            <Card className="p-8 border-0 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-indigo-600" />
                <h3 className="text-2xl font-bold text-gray-900">Technical SEO</h3>
              </div>
              <div className="space-y-4">
                {analysis.technicalSEO.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-indigo-100 text-indigo-700">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-gray-900 font-semibold">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action CTA */}
            <Card className="p-8 bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Analysis Complete!</h3>
              <p className="text-purple-100 mb-6">
                Apply these recommendations to improve your search rankings and drive more organic traffic
              </p>
              <Button
                onClick={() => {
                  setAnalysis(null);
                  setSelectedPage("");
                  setPageContent("");
                }}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Analyze Another Page
              </Button>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 p-8 border-0 shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <h2 className="text-2xl font-bold mb-4">How to Use This Tool</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">1. Select Page</h3>
              <p className="text-sm text-gray-300">
                Choose a page from the dropdown to auto-load its content, or paste content manually.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">2. AI Analysis</h3>
              <p className="text-sm text-gray-300">
                Our AI analyzes your content and generates tailored SEO recommendations based on best practices.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">3. Implement & Rank</h3>
              <p className="text-sm text-gray-300">
                Apply the suggestions to your pages and watch your search rankings improve over time.
              </p>
            </div>
          </div>
        </Card>
          </div>
        </div>
      
    </AdminRoute>
  );
}