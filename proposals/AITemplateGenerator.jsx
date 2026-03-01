import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, CheckCircle, ChevronRight } from "lucide-react";

export default function AITemplateGenerator({ onTemplateGenerated }) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    templateName: "",
    category: "General",
    serviceType: "",
    targetAudience: "",
    keyElements: "",
    tone: "professional"
  });

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const prompt = `Generate a professional proposal template for Pacific Engineering & Construction Inc.

TEMPLATE PURPOSE:
- Name: ${formData.templateName}
- Category: ${formData.category}
- Service Type: ${formData.serviceType}
- Target Audience: ${formData.targetAudience}
- Key Elements: ${formData.keyElements}
- Tone: ${formData.tone}

REQUIREMENTS:
1. Create a complete HTML proposal template suitable for engineering/construction services
2. Include placeholders using {{field_name}} format for dynamic data
3. Structure should include: header with company info, project overview, scope of work, timeline, pricing, terms & conditions
4. Make it professional, modern, and suitable for ${formData.category} projects
5. Include appropriate sections for ${formData.serviceType}

Return ONLY the HTML template content, no markdown or explanations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      const htmlTemplate = typeof response === 'string' ? response : response.content || response.text;

      // Extract field names from template
      const fieldMatches = htmlTemplate.match(/\{\{([^}]+)\}\}/g) || [];
      const uniqueFields = [...new Set(fieldMatches.map(m => m.replace(/[{}]/g, '')))];
      
      const fieldsData = uniqueFields.map(field => ({
        name: field,
        label: field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        type: "text"
      }));

      const templateData = {
        template_name: formData.templateName,
        slug: formData.templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: `AI-generated template for ${formData.serviceType} - ${formData.category}`,
        category: formData.category,
        template_body: htmlTemplate.trim(),
        fields_def: fieldsData,
        active: true
      };

      if (onTemplateGenerated) {
        onTemplateGenerated(templateData);
      }

      setStep(3);
    } catch (error) {
      console.error("Template generation error:", error);
      alert("Failed to generate template. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <Card className="p-12 text-center border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Generating Your Template...</h3>
        <p className="text-gray-600 mb-6">AI is creating a professional proposal template based on your requirements</p>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm text-gray-500 mt-4">This may take 10-15 seconds</p>
      </Card>
    );
  }

  if (step === 3) {
    return (
      <Card className="p-12 text-center border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Template Generated!</h3>
        <p className="text-gray-600 mb-6">Your AI-generated template has been created and saved. You can now edit it in the Templates tab.</p>
        <Button
          onClick={() => {
            setStep(1);
            setFormData({
              templateName: "",
              category: "General",
              serviceType: "",
              targetAudience: "",
              keyElements: "",
              tone: "professional"
            });
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Another Template
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI Template Generator</h3>
            <p className="text-sm text-gray-600">Answer a few questions to create a custom template</p>
          </div>
        </div>
      </Card>

      {step === 1 && (
        <Card className="p-6 border-0 shadow-xl">
          <h4 className="font-bold text-gray-900 mb-4">Step 1: Basic Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Template Name *</label>
              <Input
                value={formData.templateName}
                onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                placeholder="e.g., SWPPP Compliance Proposal"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SWPPP">SWPPP</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type *</label>
              <Input
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                placeholder="e.g., Stormwater Management Plan, Structural Engineering Review"
              />
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!formData.templateName || !formData.serviceType}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 border-0 shadow-xl">
          <h4 className="font-bold text-gray-900 mb-4">Step 2: Template Details</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience *</label>
              <Input
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., Commercial developers, General contractors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Key Elements to Include</label>
              <Textarea
                value={formData.keyElements}
                onChange={(e) => setFormData({ ...formData, keyElements: e.target.value })}
                placeholder="List any specific sections or elements you want in the template (e.g., compliance checklist, inspection schedule, warranty terms)"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
              <Select
                value={formData.tone}
                onValueChange={(value) => setFormData({ ...formData, tone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Formal</SelectItem>
                  <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                  <SelectItem value="technical">Technical & Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!formData.targetAudience}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Template
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}