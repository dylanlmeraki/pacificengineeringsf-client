import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Hash, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function ConstructionDocumentViewer({ doc, projectId }) {
  if (!doc) return null;

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    "Under Review": "bg-purple-100 text-purple-700",
    pending_approval: "bg-orange-100 text-orange-700",
    shared_with_client: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    answered: "bg-cyan-100 text-cyan-700",
    closed: "bg-gray-100 text-gray-700",
    rejected: "bg-red-100 text-red-700",
  };

  const meta = [
    doc.doc_number && { icon: Hash, label: "Number", value: doc.doc_number },
    doc.due_date && { icon: Calendar, label: "Due", value: format(new Date(doc.due_date), 'MMM d, yyyy') },
  ].filter(Boolean);

  return (
    <Card className="p-6 border-0 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{doc.title || doc.doc_type}</h3>
            <div className="text-sm text-gray-600">Type: {doc.doc_type}</div>
          </div>
        </div>
        <Badge className={statusColors[doc.status] || "bg-gray-100 text-gray-700"}>{doc.status}</Badge>
      </div>

      {meta.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
          {meta.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="flex items-center gap-2 text-gray-700">
                <Icon className="w-4 h-4" />
                <span className="font-medium">{m.label}:</span>
                <span>{m.value}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Fields */}
      <div className="mt-2">
        <div className="text-sm font-semibold text-gray-700 mb-2">Details</div>
        {doc.fields && Object.keys(doc.fields || {}).length > 0 ? (
          <div className="rounded-md border bg-gray-50 p-3 text-xs text-gray-700 overflow-auto max-h-80">
            <pre className="whitespace-pre-wrap">{JSON.stringify(doc.fields, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-sm text-gray-600">No additional fields</div>
        )}
      </div>

      {/* Audit */}
      {doc.audit_log && doc.audit_log.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</div>
          <div className="space-y-2">
            {doc.audit_log.slice(-5).reverse().map((e, idx) => (
              <div key={idx} className="text-xs text-gray-700 p-2 bg-white border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{e.event}</div>
                  <div className="text-gray-500">{e.timestamp ? new Date(e.timestamp).toLocaleString() : ''}</div>
                </div>
                {e.details && <div className="text-gray-600 mt-1">{typeof e.details === 'string' ? e.details : JSON.stringify(e.details)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}