import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DocsTable from "./DocsTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import DocDetailsPanel from "./DocDetailsPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Pencil, Copy, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { projectDocsApi } from "@/components/services/projectDocsApiClient";
import { rfiApi } from "@/components/services/rfiApiClient";

const TYPES = ["RFI","RFQ","RFP","Submittal","ASI","CCD","RFC","FieldReport"];
const STATUSES = ["all","draft","Under Review","pending_approval","shared_with_client","approved","answered","closed","rejected"];

export default function DocList({ onCreate, onOpen, onEdit, clientEmail=null, projectId=null }) {
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("RFQ");
  const [status, setStatus] = React.useState("all");
  const [shared, setShared] = React.useState("all");
  const [approver, setApprover] = React.useState("");
  const [due, setDue] = React.useState("all");
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [bulkDueDate, setBulkDueDate] = React.useState(null);
  const [bulkStatus, setBulkStatus] = React.useState("");
  const [bulkApprover, setBulkApprover] = React.useState("");

  const qc = useQueryClient();
  const isRFI = type === 'RFI';
  const { data: items = [], refetch, isFetching, error } = useQuery({
    queryKey: [isRFI ? 'rfis' : 'project_docs', q, type, status, shared, approver, due],
    queryFn: async () => {
      if (isRFI) {
        const query = {};
        if (q) query.$text = q;
        if (status !== 'all') query.status = status;
        if (projectId) query.project_id = projectId;
        return rfiApi.list(query, '-updated_date', 100);
      }
      const filter = { doc_type: type };
      if (q) filter.$text = q;
      if (status !== 'all') {
        const statusAlias = status === 'pending_approval' ? 'Under Review' : status;
        filter.status = statusAlias;
      }
      if (shared !== 'all') filter.is_shared_with_client = shared === 'yes';
      if (approver) filter.approver_email = approver;
      if (due === 'overdue') filter.$where = { due_date: { $lt: new Date().toISOString() } };
      if (projectId) filter.project_id = projectId;
      if (!projectId && clientEmail) {
        filter.client_email = clientEmail;
      }
      return projectDocsApi.list(filter, '-updated_date', 100);
    }
  });

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const viewItems = React.useMemo(() => {
    let arr = Array.isArray(items) ? items : [];
    if (due === 'overdue') {
      const now = Date.now();
      arr = arr.filter(it => it?.due_date && new Date(it.due_date).getTime() < now);
    }
    return arr;
  }, [items, due]);
  const [detailsDoc, setDetailsDoc] = React.useState(null);

  const openRow = (it) => {
    if (isRFI) {
      onOpen?.({ item: it, kind: 'RFI' });
      return;
    }
    setDetailsDoc(it);
    setDetailsOpen(true);
  };

  const handleRowAction = (action, it) => {
    if (action === 'share') return handleBulkShare(true, [it.id]);
    if (action === 'unshare') return handleBulkShare(false, [it.id]);
  };

  const handleBulkShare = async (share, idsOpt) => {
    const ids = idsOpt || selectedIds;
    if (!ids.length) return;
    const res = await projectDocsApi.bulkShare(ids, share).catch(e=>({ error: e?.message }));
    if (res?.error) return toast.error(res.error);
    const { updated = 0, failures = [] } = res || {};
    toast.success(`Updated ${updated}${failures.length?`, ${failures.length} failed`:''}`);
    setSelectedIds([]);
    qc.invalidateQueries({ queryKey: ['project_docs'] });
  };

  const bulkUpdate = async (patch) => {
    const ids = selectedIds;
    if (!ids.length) return;
    const { updated = 0, failures = [] } = await projectDocsApi.bulkUpdate(ids, patch).catch(()=>({updated:0, failures:[{reason:'Server error'}]}));
    toast.success(`Updated ${updated}${failures.length?`, ${failures.length} failed`:''}`);
    setSelectedIds([]);
    qc.invalidateQueries({ queryKey: ['project_docs'] });
  };

  const handleBulkSetStatus = async ()=>{
    if (!bulkStatus) return;
    await bulkUpdate({ status: bulkStatus });
  };
  const handleBulkSetDue = async ()=>{
    if (!bulkDueDate) return;
    await bulkUpdate({ due_date: bulkDueDate });
  };
  const handleBulkSetApprover = async ()=>{
    if (!bulkApprover) return;
    await bulkUpdate({ approver_email: bulkApprover });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by title or project…" className="w-64" />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={shared} onValueChange={setShared}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Shared" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Shared</SelectItem>
            <SelectItem value="no">Unshared</SelectItem>
          </SelectContent>
        </Select>
        <Input value={approver} onChange={(e)=>setApprover(e.target.value)} placeholder="Approver email…" className="w-56" />
        <Select value={due} onValueChange={setDue}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Due" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any due</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>New Document</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {TYPES.map((t) => (
              <DropdownMenuItem key={t} onClick={() => onCreate?.(t)}>
                {t}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" onClick={()=>refetch()} disabled={isFetching}>Refresh</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load</AlertTitle>
          <AlertDescription>{String(error?.message || 'Unknown error')}</AlertDescription>
        </Alert>
      )}

      {selectedIds.length>0 && (
        <div className="sticky top-[64px] z-20 bg-white border rounded-md p-3 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button size="sm" onClick={async()=>handleBulkShare(true)}>Share to client portal</Button>
          <Button size="sm" variant="outline" onClick={async()=>handleBulkShare(false)}>Unshare</Button>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger className="w-40 h-8"><SelectValue placeholder="Set status"/></SelectTrigger>
            <SelectContent>
              {STATUSES.filter(s=>s!=='all').map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" disabled={!bulkStatus} onClick={handleBulkSetStatus}>Apply</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">Set due date</Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Calendar mode="single" selected={bulkDueDate} onSelect={setBulkDueDate} />
              <div className="p-2 border-t"><Button size="sm" className="w-full" onClick={handleBulkSetDue}>Apply</Button></div>
            </PopoverContent>
          </Popover>
          <Input value={bulkApprover} onChange={(e)=>setBulkApprover(e.target.value)} placeholder="Assign approver email" className="w-56 h-8" />
          <Button size="sm" variant="outline" onClick={handleBulkSetApprover} disabled={!bulkApprover}>Assign</Button>
          <Button size="sm" variant="outline" disabled>Export (soon)</Button>
        </div>
      )}

      <DocsTable
        items={viewItems}
        onRowOpen={openRow}
        isLoading={isFetching}
        selectedIds={selectedIds}
        onToggleRow={(id, checked)=> setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x=>x!==id))}
        onToggleAll={(ids, checked)=> setSelectedIds(prev => checked ? Array.from(new Set([...prev, ...ids])) : prev.filter(id=>!ids.includes(id)))}
        onRowAction={handleRowAction}
      />
      {!isFetching && items.length===0 && (
        <div className="border rounded-lg p-8 text-center text-sm text-slate-600 bg-slate-50">
          No documents match your filters. <button className="text-blue-600 underline ml-1" onClick={()=>onCreate?.('RFQ')}>Create a new document</button>.
        </div>
      )}

      <DocDetailsPanel
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        doc={detailsDoc}
        onRefresh={()=>{ qc.invalidateQueries({ queryKey: ['project_docs'] }); }}
        onOpenFull={(doc)=> onOpen?.({ item: doc, kind: 'ProjectDoc' })}
      />
    </div>
  );
}