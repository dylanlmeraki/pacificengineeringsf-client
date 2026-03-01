import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Send, Eye, Loader2, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProposalBuilder({ projectId, project }) {
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [fields, setFields] = useState({});
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalAmount, setProposalAmount] = useState("");
  const [recipientEmails, setRecipientEmails] = useState([""]);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ['proposalTemplates'],
    queryFn: () => base44.entities.ProposalTemplate.filter({ active: true }),
    initialData: []
  });

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  useEffect(() => {
    if (selectedTemplate?.fields_def) {
      const initialFields = {};
      selectedTemplate.fields_def.forEach(f => {
        initialFields[f.name] = '';
      });
      setFields(initialFields);
      setProposalTitle(`${selectedTemplate.template_name} - ${project?.project_name || 'Project'}`);
    }
  }, [selectedTemplateId, project]);

  useEffect(() => {
    if (project?.client_email) {
      setRecipientEmails([project.client_email]);
    }
  }, [project]);

  const generatePreview = () => {
    if (!selectedTemplate) return;
    
    let html = selectedTemplate.template_body;
    Object.keys(fields).forEach(key => {
      html = html.replaceAll(`{{${key}}}`, fields[key] || '');
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #0B67A6; }
          .content { margin: 30px 0; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px; }
          .signature-box { margin-top: 60px; padding: 20px; border: 2px solid #eee; border-radius: 8px; }
          .amount-box { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; color: #0B67A6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #0B67A6; margin: 0;">${proposalTitle || selectedTemplate.template_name}</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Pacific Engineering & Construction Inc.</p>
        </div>
        <div class="content">
          ${html}
        </div>
        ${proposalAmount ? `<div class="amount-box">Total Project Amount: $${parseFloat(proposalAmount).toLocaleString()}</div>` : ''}
        <div class="signature-box">
          <p><strong>Client Signature:</strong></p>
          <p>_________________________________</p>
          <p><strong>Date:</strong> _________________________________</p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">By signing above, you agree to the terms and conditions outlined in this proposal.</p>
        </div>
        <div class="footer">
          <p>Pacific Engineering & Construction Inc.</p>
          <p>470 3rd St, San Francisco, CA 94107 | (415)-419-6079 | dylanl.peci@gmail.com</p>
        </div>
      </body>
      </html>
    `;
    
    setPreviewHtml(fullHtml);
    setShowPreview(true);
  };

  const createProposalMutation = useMutation({
    mutationFn: async (asDraft) => {
      const proposalNumber = `PROP-${Date.now()}`;
      const html = generatePreviewHtml();
      
      const proposal = await base44.entities.Proposal.create({
        project_id: projectId,
        template_id: selectedTemplateId,
        proposal_number: proposalNumber,
        title: proposalTitle || selectedTemplate.template_name,
        content_html: html,
        amount: proposalAmount ? parseFloat(proposalAmount) : null,
        status: asDraft ? 'draft' : 'sent',
        sent_date: asDraft ? null : new Date().toISOString(),
        fields_data: fields,
        recipient_emails: recipientEmails.filter(e => e)
      });

      if (!asDraft && recipientEmails.filter(e => e).length > 0) {
        for (const email of recipientEmails.filter(e => e)) {
          await base44.entities.Notification.create({
            recipient_email: email,
            type: 'proposal_sent',
            title: 'New Proposal Available',
            message: `A new proposal "${proposalTitle || selectedTemplate.template_name}" has been prepared for your review`,
            link: `/ProjectDetail?id=${projectId}`,
            priority: 'high',
            read: false,
            metadata: { proposal_id: proposal.id, amount: proposalAmount }
          });
        }
      }

      return proposal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setShowPreview(false);
      setFields({});
      setSelectedTemplateId("");
      setProposalTitle("");
      setProposalAmount("");
      setRecipientEmails([project?.client_email || ""]);
    }
  });

  const generatePreviewHtml = () => {
    if (!selectedTemplate) return '';
    
    let html = selectedTemplate.template_body;
    Object.keys(fields).forEach(key => {
      html = html.replaceAll(`{{${key}}}`, fields[key] || '');
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #0B67A6; }
          .content { margin: 30px 0; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px; }
          .signature-box { margin-top: 60px; padding: 20px; border: 2px solid #eee; border-radius: 8px; }
          .amount-box { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; color: #0B67A6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #0B67A6; margin: 0;">${proposalTitle || selectedTemplate.template_name}</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Pacific Engineering & Construction Inc.</p>
        </div>
        <div class="content">
          ${html}
        </div>
        ${proposalAmount ? `<div class="amount-box">Total Project Amount: $${parseFloat(proposalAmount).toLocaleString()}</div>` : ''}
        <div class="signature-box">
          <p><strong>Client Signature:</strong></p>
          <p>_________________________________</p>
          <p><strong>Date:</strong> _________________________________</p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">By signing above, you agree to the terms and conditions outlined in this proposal.</p>
        </div>
        <div class="footer">
          <p>Pacific Engineering & Construction Inc.</p>
          <p>470 3rd St, San Francisco, CA 94107 | (415)-419-6079 | dylanl.peci@gmail.com</p>
        </div>
      </body>
      </html>
    `;
  };

  const addRecipient = () => {
    setRecipientEmails([...recipientEmails, ""]);
  };

  const removeRecipient = (index) => {
    setRecipientEmails(recipientEmails.filter((_, i) => i !== index));
  };

  const updateRecipient = (index, value) => {
    const newEmails = [...recipientEmails];
    newEmails[index] = value;
    setRecipientEmails(newEmails);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Proposal Builder</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Template
          </label>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a proposal template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.template_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-sm text-gray-700">{selectedTemplate.description}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Proposal Title *
              </label>
              <Input
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                placeholder="Enter proposal title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Amount ($)
              </label>
              <Input
                type="number"
                value={proposalAmount}
                onChange={(e) => setProposalAmount(e.target.value)}
                placeholder="25000"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Recipient Emails
                </label>
                <Button size="sm" variant="outline" onClick={addRecipient}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {recipientEmails.map((email, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateRecipient(idx, e.target.value)}
                      placeholder="client@example.com"
                      className="flex-1"
                    />
                    {recipientEmails.length > 1 && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeRecipient(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Template Fields
              </label>
              <div className="space-y-3">
                {selectedTemplate.fields_def?.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        value={fields[field.name] || ''}
                        onChange={(e) => setFields({ ...fields, [field.name]: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        className="min-h-[100px]"
                      />
                    ) : (
                      <Input
                        type={field.type || 'text'}
                        value={fields[field.name] || ''}
                        onChange={(e) => setFields({ ...fields, [field.name]: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={generatePreview}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={() => createProposalMutation.mutate(true)}
                disabled={createProposalMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                Save Draft
              </Button>
              <Button
                onClick={() => createProposalMutation.mutate(false)}
                disabled={createProposalMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {createProposalMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Proposal
              </Button>
            </div>
          </>
        )}

        {showPreview && previewHtml && (
          <div className="mt-6 border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Preview</h4>
            <div className="border rounded-lg p-6 bg-white max-h-96 overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}