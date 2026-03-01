import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ActivityFeed from "./ActivityFeed";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { projectDocsApi } from "@/components/services/projectDocsApiClient";

const STATUSES = ["draft","Under Review","shared_with_client","approved","answered","closed","rejected","pending_approval"];

export default function DocDetailsPanel({ open, onOpenChange, doc, onRefresh, onOpenFull }) {
  const [local, setLocal] = React.useState(doc);
  React.useEffect(()=>{ setLocal(doc); }, [doc?.id]);

  if (!doc) return null;

  const saveField = async (patch) => {
    const next = { ...patch };
    if (typeof next.status === 'string' && next.status === 'pending_approval') {
      next.status = 'Under Review';
    }
    setLocal((prev)=>({ ...prev, ...next }));
    await projectDocsApi.update(doc.id, next);
    onRefresh?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="truncate">{doc.title || 'Untitled'}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm" onClick={()=>onOpenFull?.(doc)}>Open full view</Button>
          </div>

          <TabsContent value="info" className="mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <Select value={local?.status || ''} onValueChange={(v)=>saveField({ status: v })}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Due Date</div>
                <Input type="date" value={local?.due_date || ''} onChange={(e)=>saveField({ due_date: e.target.value })} />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Approver Email</div>
                <Input type="email" value={local?.approver_email || ''} onChange={(e)=>saveField({ approver_email: e.target.value })} placeholder="approver@example.com" />
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="text-xs text-slate-500">Share with client</div>
                <Switch checked={!!local?.is_shared_with_client} onCheckedChange={(v)=>saveField({ is_shared_with_client: v })} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-3">
            <div className="space-y-2">
             {(doc.attachments_meta || []).map((a, idx) => (
               <div key={idx} className="border rounded p-2 text-xs">
                 <div className="flex items-center justify-between">
                   <div className="truncate">
                     <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{a.name || a.url}</a>
                     {a.size ? <span className="ml-2 text-slate-500">({Math.round(a.size/1024)} KB)</span> : null}
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="text-slate-500">{a.uploaded_at ? new Date(a.uploaded_at).toLocaleString() : ''}</div>
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
                             try { await run(); toast.success('Attachment removed'); }
                             catch (e) {
                               toast.error('Failed to remove. Retrying…');
                               try { await run(); toast.success('Attachment removed'); } catch (err) { toast.error(err?.message || 'Remove failed'); }
                             }
                           }}>Remove</AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                   </div>
                 </div>
                 {a.extraction_status === 'error' && <div className="text-red-600 mt-1">Extraction failed</div>}
                 {a.extracted_text && <div className="mt-1 bg-slate-50 border rounded p-2 max-h-28 overflow-auto whitespace-pre-wrap">{a.extracted_text}</div>}
                 {Array.isArray(a.extracted_rows) && a.extracted_rows.length>0 && (
                   <div className="mt-1 bg-slate-50 border rounded p-2 max-h-28 overflow-auto">
                     <div className="font-medium mb-1">Rows ({a.extracted_rows.length})</div>
                     <pre className="whitespace-pre-wrap">{JSON.stringify(a.extracted_rows.slice(0,30), null, 2)}</pre>
                   </div>
                 )}
               </div>
             ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-3">
            <ActivityFeed entityName="ProjectDoc" entityId={doc.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}