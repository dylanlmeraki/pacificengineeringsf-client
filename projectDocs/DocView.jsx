import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DocThread from "./DocThread";
import { projectDocsApi } from "@/components/services/projectDocsApiClient";
import { base44 } from "@/api/base44Client";
import UploadArea from "./UploadArea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function DocView({ doc, onRefresh, onBack }) {
  const setStatus = async (status, extra={}) => {
    await projectDocsApi.update(doc.id, { status, ...extra });
    onRefresh?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">[{doc.doc_type}] {doc.title}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button variant="outline" disabled={!doc.approver_email} onClick={()=>setStatus('Under Review')}>Submit for Approval</Button>
          <Button onClick={()=>setStatus('shared_with_client', { is_shared_with_client: true })}>Share with Client</Button>
        </div>
      </div>

      <Card>
       <CardHeader><CardTitle>Details</CardTitle></CardHeader>
       <CardContent>
         <div className="grid md:grid-cols-2 gap-2 text-sm">
           <div><span className="text-gray-500">Number:</span> {doc.doc_number || '—'}</div>
           <div><span className="text-gray-500">Status:</span> {doc.status}</div>
           <div><span className="text-gray-500">Project:</span> {doc.project_name || doc.project_id}</div>
           <div><span className="text-gray-500">Approver:</span> {doc.approver_email || <span className="text-red-600">Missing</span>}</div>
         </div>
         {!doc.approver_email && (
           <div className="mt-2 text-xs text-red-600">Add an approver email to enable approval routing.</div>
         )}
       </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(doc.attachments_meta || []).map((a, idx) => (
              <div key={idx} className="border rounded p-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="truncate">
                    <a className="text-blue-600 hover:underline" href={a.url} target="_blank" rel="noreferrer">{a.name || a.url}</a>
                    {a.size ? <span className="text-xs text-slate-500 ml-2">({Math.round(a.size/1024)} KB)</span> : null}
                    {a.extraction_status === 'error' && <span className="ml-2 text-xs text-red-600">Extraction failed</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-500">{a.uploaded_by} • {a.uploaded_at ? new Date(a.uploaded_at).toLocaleString() : ''}</div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">Remove</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove attachment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the file reference from this document. The original file remains in storage.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={async()=>{
                            const run = async () => {
                              await projectDocsApi.update(doc.id, { attachments_meta: (doc.attachments_meta||[]).filter((x)=> x.url !== a.url) });
                              onRefresh?.();
                            };
                            try {
                              await run();
                              toast.success("Attachment removed");
                            } catch (e) {
                              toast.error("Failed to remove. Retrying…");
                              try { await run(); toast.success("Attachment removed"); } catch (err) { toast.error(err?.message || "Remove failed"); }
                            }
                          }}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button size="sm" variant="outline" onClick={async()=>{
                      const run = async () => {
                        await projectDocsApi.update(doc.id, { attachments_meta: (doc.attachments_meta||[]).map((x)=> x.url===a.url? { ...x, extraction_status: 'pending', extraction_error: null }: x) });
                        await base44.functions.invoke('processAttachment', { doc_id: doc.id, file_url: a.url, name: a.name, size: a.size, mime_type: a.mime_type });
                        onRefresh?.();
                      };
                      try {
                        await run();
                        toast.success("Re-extraction started");
                      } catch (e) {
                        toast.error("Re-extract failed. Retrying…");
                        try { await run(); toast.success("Re-extraction started"); } catch (err) { toast.error(err?.message || "Re-extract failed"); }
                      }
                    }}>Re-extract</Button>
                  </div>
                </div>
                {a.ext && ['jpg','jpeg','png','gif'].includes(a.ext) && (
                  <div className="mt-2"><img src={a.url} alt={a.name} className="max-h-48 rounded" /></div>
                )}
                {a.ext === 'pdf' && (
                  <div className="mt-2"><a href={a.url} target="_blank" className="text-sm text-blue-600 hover:underline">View PDF</a></div>
                )}
                {a.extracted_text && (
                  <div className="mt-2 text-xs bg-slate-50 border rounded p-2 max-h-40 overflow-auto whitespace-pre-wrap">{a.extracted_text}</div>
                )}
                {Array.isArray(a.extracted_rows) && a.extracted_rows.length>0 && (
                  <div className="mt-2 text-xs bg-slate-50 border rounded p-2 max-h-40 overflow-auto">
                    <div className="font-medium mb-1">Extracted Rows ({a.extracted_rows.length})</div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(a.extracted_rows.slice(0,50), null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
            {/* Upload */}
            <UploadArea docId={doc.id} onComplete={onRefresh} />
          </div>
        </CardContent>
      </Card>

      {doc.rendered_body && (
        <Card>
          <CardHeader><CardTitle>Document</CardTitle></CardHeader>
          <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: doc.rendered_body }} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Discussion</CardTitle></CardHeader>
        <CardContent>
          <DocThread doc={doc} />
        </CardContent>
      </Card>
    </div>
  );
}