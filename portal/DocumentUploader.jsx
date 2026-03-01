import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Loader2, FileText, CheckCircle2, FolderOpen } from "lucide-react";

export default function DocumentUploader({ projectId, projects = [], onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [formData, setFormData] = useState({
    document_name: "",
    document_type: "Other",
    description: "",
    version: "1.0"
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const dropRef = useRef(null);

  const effectiveProjectId = selectedProjectId || projectId;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.document_name) {
        setFormData({ ...formData, document_name: file.name });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.document_name) {
        setFormData({ ...formData, document_name: file.name });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !effectiveProjectId) return;

    setUploading(true);
    setUploadSuccess(false);
    setUploadProgress(10);

    try {
      const user = await base44.auth.me();
      
      setUploadProgress(30);
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      setUploadProgress(60);
      // Create document record
      const document = await base44.entities.ProjectDocument.create({
        project_id: effectiveProjectId,
        document_name: formData.document_name,
        document_type: formData.document_type,
        description: formData.description,
        version: formData.version,
        file_url: file_url,
        file_size: selectedFile.size,
        uploaded_by: user.email,
        uploaded_by_name: user.full_name,
        status: "Draft"
      });

      setUploadProgress(80);
      // Get project details and notify team
      const projectResults = await base44.entities.Project.filter({ id: effectiveProjectId });
      if (projectResults.length > 0) {
        const project = projectResults[0];
        
        // Notify assigned team members
        if (project.assigned_team_members && project.assigned_team_members.length > 0) {
          for (const teamMemberEmail of project.assigned_team_members) {
            await base44.entities.Notification.create({
              recipient_email: teamMemberEmail,
              type: 'document_upload',
              title: 'New Document Uploaded',
              message: `${user.full_name} uploaded ${formData.document_name} to ${project.project_name}`,
              link: `/ProjectDetail?id=${projectId}`,
              priority: 'normal',
              read: false,
              metadata: { 
                document_id: document.id,
                project_id: projectId,
                document_type: formData.document_type 
              }
            });
          }
        }
      }
      
      // Also notify admins
      const adminUsers = await base44.entities.User.filter({ role: 'admin' });
      for (const admin of adminUsers) {
        await base44.entities.Notification.create({
          recipient_email: admin.email,
          type: 'document_upload',
          title: 'New Document Uploaded',
          message: `${user.full_name} uploaded ${formData.document_name} (${formData.document_type})`,
          link: `/ProjectDetail?id=${projectId}`,
          priority: 'normal',
          read: false,
          metadata: { 
            document_id: document.id,
            project_id: projectId,
            document_type: formData.document_type 
          }
        });
      }

      setUploadSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setSelectedFile(null);
        setFormData({
          document_name: "",
          document_type: "Other",
          description: "",
          version: "1.0"
        });
        setUploadSuccess(false);
        if (onUploadComplete) onUploadComplete();
      }, 2000);
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document. Please try again.");
    }

    setUploading(false);
  };

  if (uploadSuccess) {
    return (
      <Card className="p-8 text-center border-2 border-green-200 bg-green-50">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Document Uploaded!</h3>
        <p className="text-sm text-gray-600">Your file has been successfully uploaded.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-lg bg-white">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Document</h3>
      
      <div className="space-y-4">
        {/* Project Folder Selection (when multiple projects available) */}
        {projects.length > 1 && !projectId && (
          <div>
            <Label className="block mb-2">
              <FolderOpen className="w-4 h-4 inline mr-1" />
              Select Project Folder *
            </Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.project_name} ({p.project_number || p.project_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Drag & Drop File Selector */}
        <div>
          <Label htmlFor="file-upload" className="block mb-2">Select File *</Label>
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
            }`}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="ml-4 text-red-600 hover:text-red-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Drag & drop a file here, or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Supports PDF, DOC, XLS, images, and more</p>
              </div>
            )}
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Document Name */}
        <div>
          <Label htmlFor="doc-name">Document Name *</Label>
          <Input
            id="doc-name"
            value={formData.document_name}
            onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
            placeholder="Enter document name"
          />
        </div>

        {/* Document Type */}
        <div>
          <Label>Document Type *</Label>
          <Select value={formData.document_type} onValueChange={(value) => setFormData({ ...formData, document_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SWPPP Plan">SWPPP Plan</SelectItem>
              <SelectItem value="Inspection Report">Inspection Report</SelectItem>
              <SelectItem value="Test Results">Test Results</SelectItem>
              <SelectItem value="Engineering Drawing">Engineering Drawing</SelectItem>
              <SelectItem value="Photo">Photo</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Invoice">Invoice</SelectItem>
              <SelectItem value="Permit">Permit</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Version */}
        <div>
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            placeholder="e.g., 1.0"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add notes or description..."
            rows={3}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Uploading...</span>
              <span className="font-semibold text-blue-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !formData.document_name || !effectiveProjectId || uploading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}