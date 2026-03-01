import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, CheckCircle, Loader2 } from "lucide-react";

export default function ProjectRequestForm({ user, onSuccess }) {
  const [formData, setFormData] = useState({
    request_title: "",
    project_type: "",
    description: "",
    location: "",
    estimated_start_date: "",
    budget_range: "",
    urgency: "Medium"
  });
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      const request = await base44.entities.ProjectRequest.create(data);
      
      // Notify admins
      const adminUsers = await base44.entities.User.filter({ role: 'admin' });
      for (const admin of adminUsers) {
        await base44.entities.Notification.create({
          recipient_email: admin.email,
          type: 'project_update',
          title: 'New Project Request',
          message: `${user.full_name} has submitted a new project request: ${data.request_title}`,
          link: `/ProjectRequests`,
          priority: 'high',
          read: false
        });
      }

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project-requests']);
      setFormData({
        request_title: "",
        project_type: "",
        description: "",
        location: "",
        estimated_start_date: "",
        budget_range: "",
        urgency: "Medium"
      });
      setAttachments([]);
      if (onSuccess) onSuccess();
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setAttachments([...attachments, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.request_title || !formData.project_type || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    createRequestMutation.mutate({
      ...formData,
      client_email: user.email,
      client_name: user.full_name,
      client_company: user.company_name || "",
      attachments,
      status: "Pending Review"
    });
  };

  return (
    <Card className="p-8 border-0 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Request New Project</h2>
          <p className="text-gray-600">Tell us about your project needs</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <Input
            value={formData.request_title}
            onChange={(e) => setFormData({ ...formData, request_title: e.target.value })}
            placeholder="e.g., SWPPP for New Office Building"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type *
            </label>
            <Select
              value={formData.project_type}
              onValueChange={(value) => setFormData({ ...formData, project_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SWPPP">SWPPP</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Inspections">Inspections</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Special Inspections">Special Inspections</SelectItem>
                <SelectItem value="Multiple Services">Multiple Services</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency
            </label>
            <Select
              value={formData.urgency}
              onValueChange={(value) => setFormData({ ...formData, urgency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your project requirements, scope, and any specific needs..."
            className="min-h-[120px]"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Start Date
            </label>
            <Input
              type="date"
              value={formData.estimated_start_date}
              onChange={(e) => setFormData({ ...formData, estimated_start_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Range
          </label>
          <Input
            value={formData.budget_range}
            onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
            placeholder="e.g., $10,000 - $25,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Upload Files</span>
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            {isUploading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
          </div>
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Attachment {idx + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createRequestMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {createRequestMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}