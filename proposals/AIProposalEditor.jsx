import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Save, Send, Eye, Edit3, Wand2, Loader2 } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { base44 } from "@/api/base44Client";
import TemplateRecommender from "./TemplateRecommender";

export default function AIProposalEditor({ proposal, onSave, onSend, proposalCategory }) {
  const [isEditing, setIsEditing] = useState(true);
  const [editedProposal, setEditedProposal] = useState({
    title: proposal.title || '',
    content_html: proposal.content_html || '',
    amount: proposal.amount || 0,
    recipient_emails: proposal.recipient_emails || []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSection, setGenerationSection] = useState(null);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ]
  };

  const handleSave = () => {
    onSave(editedProposal);
  };

  const handleSend = () => {
    onSend(editedProposal);
  };

  const handleGenerateContent = async (sectionType) => {
    setIsGenerating(true);
    setGenerationSection(sectionType);

    try {
      const projectContext = proposal.project_id ? 
        `Project ID: ${proposal.project_id}. ` : '';
      
      const prompts = {
        scope: `Generate a detailed project scope section for a proposal titled "${editedProposal.title}". ${projectContext}Include what will be done, what is included, and what is excluded. Return only the HTML content.`,
        deliverables: `Generate a comprehensive deliverables section for a proposal titled "${editedProposal.title}". ${projectContext}List all deliverables with clear descriptions. Return only the HTML content.`,
        timeline: `Generate a realistic project timeline section for a proposal titled "${editedProposal.title}". ${projectContext}Include phases, milestones, and estimated durations. Return only the HTML content.`,
        full: `Generate complete professional proposal content for "${editedProposal.title}". ${projectContext}Include executive summary, scope, deliverables, timeline, and pricing structure. Return only the HTML content.`
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[sectionType],
        add_context_from_internet: false
      });

      const generatedContent = typeof response === 'string' ? response : JSON.stringify(response);
      
      setEditedProposal({
        ...editedProposal,
        content_html: editedProposal.content_html + '\n\n' + generatedContent
      });
    } catch (error) {
      console.error("Content generation error:", error);
      alert("Failed to generate content. Please try again.");
    }

    setIsGenerating(false);
    setGenerationSection(null);
  };

  const handleUseTemplate = (template) => {
    setEditedProposal({
      ...editedProposal,
      content_html: template.template_body
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Recommendations */}
      {editedProposal.title && (
        <TemplateRecommender
          proposalTitle={editedProposal.title}
          proposalCategory={proposalCategory || "General"}
          onSelectTemplate={handleUseTemplate}
        />
      )}
      {/* Header */}
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI-Generated Proposal</h3>
              <p className="text-sm text-gray-600">Review and edit before sending to client</p>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="gap-2"
          >
            {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? 'Preview' : 'Edit'}
          </Button>
        </div>
      </Card>

      {/* Editor Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card className="p-6 border-0 shadow-lg">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-semibold mb-2 block">Proposal Title</Label>
                <Input
                  value={editedProposal.title}
                  onChange={(e) => setEditedProposal({ ...editedProposal, title: e.target.value })}
                  placeholder="Enter proposal title..."
                  className="text-lg font-semibold"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-700 font-semibold">Proposal Content</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateContent('scope')}
                      disabled={isGenerating}
                      className="text-xs"
                    >
                      {isGenerating && generationSection === 'scope' ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      + Scope
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateContent('deliverables')}
                      disabled={isGenerating}
                      className="text-xs"
                    >
                      {isGenerating && generationSection === 'deliverables' ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      + Deliverables
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateContent('timeline')}
                      disabled={isGenerating}
                      className="text-xs"
                    >
                      {isGenerating && generationSection === 'timeline' ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      + Timeline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleGenerateContent('full')}
                      disabled={isGenerating}
                      className="text-xs bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating && generationSection === 'full' ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      Generate Full
                    </Button>
                  </div>
                </div>
                {isEditing ? (
                  <div className="border rounded-lg overflow-hidden">
                    <ReactQuill
                      value={editedProposal.content_html}
                      onChange={(content) => setEditedProposal({ ...editedProposal, content_html: content })}
                      modules={quillModules}
                      theme="snow"
                      className="bg-white"
                      style={{ minHeight: '500px' }}
                    />
                  </div>
                ) : (
                  <div 
                    className="prose max-w-none bg-white p-8 rounded-lg border"
                    dangerouslySetInnerHTML={{ __html: editedProposal.content_html }}
                  />
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card className="p-6 border-0 shadow-lg">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-semibold mb-2 block">Recipient Email(s)</Label>
                <Input
                  value={editedProposal.recipient_emails.join(', ')}
                  onChange={(e) => setEditedProposal({ 
                    ...editedProposal, 
                    recipient_emails: e.target.value.split(',').map(email => email.trim()) 
                  })}
                  placeholder="client@example.com, client2@example.com"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-semibold mb-2 block">Estimated Amount (Optional)</Label>
                <Input
                  type="number"
                  value={editedProposal.amount || ''}
                  onChange={(e) => setEditedProposal({ ...editedProposal, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave at 0 if providing detailed cost estimate separately
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Wand2 className="w-4 h-4 text-blue-600" />
            <span>Generated by AI - edit as needed</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              variant="outline"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button
              onClick={handleSend}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white gap-2"
            >
              <Send className="w-4 h-4" />
              Send to Client
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}