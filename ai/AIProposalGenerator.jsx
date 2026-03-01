import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Wand2, Loader2, CheckCircle, FileText, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function AIProposalGenerator({ projectRequest, onProposalGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState(null);
  const [editing, setEditing] = useState(false);

  const generateProposal = async () => {
    try {
      setGenerating(true);
      const { data } = await base44.functions.invoke('generateProposalDraft', {
        projectRequestId: projectRequest?.id,
        projectDetails: {
          title: projectRequest?.request_title,
          type: projectRequest?.project_type,
          description: projectRequest?.description,
          location: projectRequest?.location,
          budget: projectRequest?.budget_range,
          timeline: projectRequest?.timeline
        }
      });

      setGeneratedProposal(data.proposal);
      toast.success("Proposal draft generated!");
      
      if (onProposalGenerated) {
        onProposalGenerated(data.proposal);
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate proposal");
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = (field, value) => {
    setGeneratedProposal({
      ...generatedProposal,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Proposal Generator</h3>
              <p className="text-sm text-gray-600">Generate personalized proposals instantly</p>
            </div>
          </div>

          <Button
            onClick={generateProposal}
            disabled={generating}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Proposal
              </>
            )}
          </Button>
        </div>

        {projectRequest && (
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-gray-900">Project Details</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium text-gray-900">{projectRequest.project_type}</span>
              </div>
              {projectRequest.location && (
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium text-gray-900">{projectRequest.location}</span>
                </div>
              )}
              {projectRequest.budget_range && (
                <div>
                  <span className="text-gray-600">Budget:</span>
                  <span className="ml-2 font-medium text-gray-900">{projectRequest.budget_range}</span>
                </div>
              )}
              {projectRequest.timeline && (
                <div>
                  <span className="text-gray-600">Timeline:</span>
                  <span className="ml-2 font-medium text-gray-900">{projectRequest.timeline}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {generatedProposal && (
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-bold text-gray-900">Generated Proposal Draft</h4>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {editing ? "Preview" : "Edit"}
            </Button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
              {editing ? (
                <Textarea
                  value={generatedProposal.title}
                  onChange={(e) => handleEdit('title', e.target.value)}
                  rows={2}
                  className="font-semibold"
                />
              ) : (
                <div className="text-xl font-bold text-gray-900">{generatedProposal.title}</div>
              )}
            </div>

            {/* Introduction */}
            {generatedProposal.introduction && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Introduction</label>
                {editing ? (
                  <Textarea
                    value={generatedProposal.introduction}
                    onChange={(e) => handleEdit('introduction', e.target.value)}
                    rows={4}
                  />
                ) : (
                  <div className="text-gray-700 leading-relaxed">{generatedProposal.introduction}</div>
                )}
              </div>
            )}

            {/* Scope of Work */}
            {generatedProposal.scopeOfWork && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Scope of Work</label>
                {editing ? (
                  <Textarea
                    value={generatedProposal.scopeOfWork}
                    onChange={(e) => handleEdit('scopeOfWork', e.target.value)}
                    rows={6}
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {generatedProposal.scopeOfWork.split('\n').map((line, idx) => (
                      <p key={idx} className="text-gray-700">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deliverables */}
            {generatedProposal.deliverables && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Deliverables</label>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {generatedProposal.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Pricing */}
            {generatedProposal.pricing && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Estimated Investment</label>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${generatedProposal.pricing.toLocaleString()}
                  </div>
                  {generatedProposal.pricingNote && (
                    <p className="text-sm text-gray-600">{generatedProposal.pricingNote}</p>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {generatedProposal.timeline && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Project Timeline</label>
                {editing ? (
                  <Textarea
                    value={generatedProposal.timeline}
                    onChange={(e) => handleEdit('timeline', e.target.value)}
                    rows={3}
                  />
                ) : (
                  <div className="text-gray-700">{generatedProposal.timeline}</div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}