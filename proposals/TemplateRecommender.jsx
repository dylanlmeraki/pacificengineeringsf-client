import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, FileText } from "lucide-react";

export default function TemplateRecommender({ proposalTitle, proposalCategory, onSelectTemplate }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (proposalTitle && proposalCategory) {
      fetchRecommendations();
    }
  }, [proposalTitle, proposalCategory]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const templates = await base44.entities.ProposalTemplate.filter({
        category: proposalCategory,
        active: true
      });

      if (templates.length === 0) {
        const allTemplates = await base44.entities.ProposalTemplate.filter({ active: true });
        setRecommendations(allTemplates.slice(0, 3));
      } else {
        setRecommendations(templates.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      setRecommendations([]);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">Finding relevant templates...</span>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h4 className="font-bold text-gray-900">Recommended Templates</h4>
      </div>
      <div className="space-y-2">
        {recommendations.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-purple-400 transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">{template.template_name}</div>
              <Badge variant="outline" className="text-xs mt-1">{template.category}</Badge>
            </div>
            <Button
              size="sm"
              onClick={() => onSelectTemplate(template)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FileText className="w-3 h-3 mr-1" />
              Use
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}