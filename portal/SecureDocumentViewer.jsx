import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Lock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SecureDocumentViewer({ documents = [] }) {
  const [viewingDoc, setViewingDoc] = useState(null);

  const getFileExtension = (url) => {
    if (!url) return 'unknown';
    return url.split('.').pop().toLowerCase();
  };

  const getFileIcon = (url) => {
    const ext = getFileExtension(url);
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const canPreview = (url) => {
    const ext = getFileExtension(url);
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  const handleDownload = (doc) => {
    window.open(doc.file_url, '_blank');
  };

  const typeColors = {
    "SWPPP Plan": "bg-blue-100 text-blue-700",
    "Inspection Report": "bg-green-100 text-green-700",
    "Test Results": "bg-purple-100 text-purple-700",
    "Engineering Drawing": "bg-orange-100 text-orange-700",
    "Contract": "bg-red-100 text-red-700",
    "Photo": "bg-cyan-100 text-cyan-700",
    "Other": "bg-gray-100 text-gray-700"
  };

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents available</p>
        </Card>
      ) : (
        documents.map((doc) => (
          <Card key={doc.id} className="p-4 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getFileIcon(doc.file_url)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{doc.document_name}</h4>
                    <Badge className={typeColors[doc.document_type] || typeColors["Other"]}>
                      {doc.document_type}
                    </Badge>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Uploaded: {format(new Date(doc.created_date), 'MMM d, yyyy')}</span>
                    {doc.file_size && (
                      <span>Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canPreview(doc.file_url) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingDoc(doc)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(doc)}
                  className="text-blue-600"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}

      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewingDoc?.document_name}</DialogTitle>
          </DialogHeader>
          {viewingDoc && (
            <div className="space-y-4">
              {getFileExtension(viewingDoc.file_url) === 'pdf' ? (
                <iframe
                  src={viewingDoc.file_url}
                  className="w-full h-[600px] border-0 rounded-lg"
                  title={viewingDoc.document_name}
                />
              ) : (
                <img
                  src={viewingDoc.file_url}
                  alt={viewingDoc.document_name}
                  className="w-full rounded-lg"
                />
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewingDoc(null)}>
                  Close
                </Button>
                <Button onClick={() => handleDownload(viewingDoc)} className="bg-blue-600">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}