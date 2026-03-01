import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Download, 
  Calendar,
  User,
  Filter,
  File,
  Image as ImageIcon,
  FileCheck
} from "lucide-react";
import { format } from "date-fns";

export default function DocumentsManager({ documents, projects }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.project_name || "Unknown Project";
  };

  const getFileIcon = (docType) => {
    const iconMap = {
      'Photo': ImageIcon,
      'Engineering Drawing': FileCheck,
      'SWPPP Plan': FileText,
      'Inspection Report': FileCheck,
      'Test Results': FileCheck,
      'Contract': FileText,
      'Invoice': FileText,
      'Permit': FileText
    };
    return iconMap[docType] || File;
  };

  const getFileExtension = (url) => {
    return url?.split('.').pop()?.toUpperCase() || 'FILE';
  };

  // Filter documents
  let filteredDocs = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.document_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    const matchesProject = projectFilter === "all" || doc.project_id === projectFilter;
    return matchesSearch && matchesType && matchesProject;
  });

  // Sort documents
  filteredDocs = [...filteredDocs].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.created_date) - new Date(a.created_date);
      case "date-asc":
        return new Date(a.created_date) - new Date(b.created_date);
      case "name-asc":
        return a.document_name.localeCompare(b.document_name);
      case "name-desc":
        return b.document_name.localeCompare(a.document_name);
      default:
        return 0;
    }
  });

  const documentTypes = [...new Set(documents.map(d => d.document_type))].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6 border-0 shadow-lg bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Search & Filter</h3>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(searchQuery || typeFilter !== "all" || projectFilter !== "all") && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {filteredDocs.length} of {documents.length} documents
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setProjectFilter("all");
              }}
              className="text-blue-600"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg bg-white">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-gray-600">
            {searchQuery || typeFilter !== "all" || projectFilter !== "all"
              ? "Try adjusting your filters"
              : "Documents will appear here once they are uploaded"}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const FileIcon = getFileIcon(doc.document_type);
            return (
              <Card key={doc.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <FileIcon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1 truncate">{doc.document_name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {doc.document_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getFileExtension(doc.file_url)}
                      </Badge>
                      {doc.version && (
                        <Badge variant="outline" className="text-xs">
                          v{doc.version}
                        </Badge>
                      )}
                    </div>
                    
                    {doc.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                    )}
                    
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        <span>{getProjectName(doc.project_id)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{doc.uploaded_by_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(doc.created_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}