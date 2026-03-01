import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";

const DEFAULT_COLUMNS = [
  { key: "doc_number", label: "#" },
  { key: "title", label: "Title" },
  { key: "doc_type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "due_date", label: "Due" },
  { key: "project_name", label: "Project" },
  { key: "approver_email", label: "Approver" },
  { key: "created_by", label: "Created By" },
  { key: "attachments_count", label: "Files" },
  { key: "updated_date", label: "Updated" },
];

export default function DocsTable({ items = [], onRowOpen, isLoading, selectedIds = [], onToggleRow, onToggleAll, onRowAction }) {
  const [visibleCols, setVisibleCols] = React.useState(() => DEFAULT_COLUMNS.map(c => c.key));
  const [sort, setSort] = React.useState({ key: "updated_date", dir: "desc" });
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [localQ, setLocalQ] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const toggleCol = (key) => {
    setVisibleCols((prev) => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filtered = React.useMemo(() => {
    const q = localQ.toLowerCase();
    const base = q
      ? items.filter(it => (it.title||'').toLowerCase().includes(q) || (it.project_name||'').toLowerCase().includes(q) || (it.doc_number||'').toLowerCase().includes(q))
      : items;
    const s = [...base].sort((a,b) => {
      const ka = a[sort.key];
      const kb = b[sort.key];
      if (ka == null && kb == null) return 0;
      if (ka == null) return sort.dir === 'asc' ? -1 : 1;
      if (kb == null) return sort.dir === 'asc' ? 1 : -1;
      if (typeof ka === 'string' && typeof kb === 'string') {
        return sort.dir === 'asc' ? ka.localeCompare(kb) : kb.localeCompare(ka);
      }
      const va = new Date(ka).toString() !== 'Invalid Date' ? new Date(ka).getTime() : ka;
      const vb = new Date(kb).toString() !== 'Invalid Date' ? new Date(kb).getTime() : kb;
      return sort.dir === 'asc' ? (va > vb ? 1 : va < vb ? -1 : 0) : (va < vb ? 1 : va > vb ? -1 : 0);
    });
    return s;
  }, [items, localQ, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [page, pageItems.length]);

  const headerClick = (key) => {
    setSort((prev) => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const colDefs = DEFAULT_COLUMNS.filter(c => visibleCols.includes(c.key));

  React.useEffect(()=>{
    // Ensure default visible includes the new full set (but allow user to toggle later)
    setVisibleCols(DEFAULT_COLUMNS.map(c=>c.key));
  }, []);

  return (
    <div className="space-y-3" tabIndex={0} onKeyDown={(e)=>{
      if(e.key==='ArrowDown') { setSelectedIndex(i=>Math.min(pageItems.length-1, i+1)); }
      else if(e.key==='ArrowUp') { setSelectedIndex(i=>Math.max(0, i-1)); }
      else if(e.key==='Enter') { const it = pageItems[selectedIndex]; if (it) onRowOpen?.(it); }
    }}>
      <div className="flex items-center justify-between gap-2">
        <Input value={localQ} onChange={(e)=>{ setLocalQ(e.target.value); setPage(1); }} placeholder="Quick filter…" className="w-64" />
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(parseInt(v,10)); setPage(1); }}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10,25,50].map(n => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2"><Settings2 className="w-4 h-4"/> Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {DEFAULT_COLUMNS.map(c => (
                <DropdownMenuCheckboxItem key={c.key} checked={visibleCols.includes(c.key)} onCheckedChange={()=>toggleCol(c.key)}>
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border overflow-auto max-h-[70vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={pageItems.length>0 && pageItems.every(it=>selectedIds.includes(it.id))}
                  onCheckedChange={(v)=> onToggleAll?.(pageItems.map(i=>i.id), Boolean(v))}
                />
              </TableHead>
              {colDefs.map(col => (
                <TableHead key={col.key} className="cursor-pointer select-none" onClick={()=>headerClick(col.key)}>
                  {col.label}{sort.key===col.key ? (sort.dir==='asc' ? ' ▲' : ' ▼') : ''}
                </TableHead>
              ))}
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({length: Math.min(pageSize, 8)}).map((_,i)=> (
              <TableRow key={`s-${i}`}>
                {colDefs.map((c, idx)=> (
                  <TableCell key={c.key+idx}><Skeleton className="h-4 w-full"/></TableCell>
                ))}
                <TableCell><Skeleton className="h-6 w-16"/></TableCell>
              </TableRow>
            ))}
            {!isLoading && pageItems.map((it, idx) => (
              <TableRow
                key={it.id}
                tabIndex={0}
                className={`cursor-pointer ${selectedIndex===idx ? 'bg-accent' : 'hover:bg-accent'}`}
                onMouseEnter={()=>setSelectedIndex(idx)}
                onClick={()=>onRowOpen?.(it)}
                onKeyDown={(e)=>{ if(e.key==='Enter') onRowOpen?.(it); }}
              >
                <TableCell onClick={(e)=>e.stopPropagation()} className="w-10">
                  <Checkbox checked={selectedIds.includes(it.id)} onCheckedChange={(v)=> onToggleRow?.(it.id, Boolean(v))} />
                </TableCell>
                {colDefs.map(col => (
                  <TableCell key={col.key}>
                    {(() => {
                      if (col.key === 'status') {
                        const s = (it.status||'').toLowerCase();
                        const map = {
                          draft: 'bg-slate-100 text-slate-700',
                          pending_approval: 'bg-amber-100 text-amber-700',
                          'under review': 'bg-amber-100 text-amber-700',
                          'under_review': 'bg-amber-100 text-amber-700',
                          'Under Review': 'bg-amber-100 text-amber-700',
                          approved: 'bg-green-100 text-green-700',
                          rejected: 'bg-red-100 text-red-700',
                          shared_with_client: 'bg-blue-100 text-blue-700',
                        };
                        return (
                          <div className="flex items-center gap-2">
                            <Badge className={map[s] || 'bg-slate-100 text-slate-700'}>{it.status || '—'}</Badge>
                            {(s==='shared_with_client' || it.is_shared_with_client) && (
                              <Badge variant="outline">Shared</Badge>
                            )}
                          </div>
                        );
                      }
                      if (col.key === 'due_date') {
                        const d = it.due_date ? new Date(it.due_date) : null;
                        const overdue = d && d.getTime() < Date.now();
                        return d ? (
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>{d.toLocaleDateString()}</span>
                        ) : '—';
                      }
                      if (col.key === 'approver_email') {
                        const email = it.approver_email || '';
                        const initials = email ? (email.split('@')[0].slice(0,2)).toUpperCase() : '';
                        return (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-700">
                              {initials || '?'}
                            </div>
                            <span className="truncate max-w-[180px]" title={email}>{email || '—'}</span>
                          </div>
                        );
                      }
                      if (col.key === 'updated_date') return it.updated_date ? new Date(it.updated_date).toLocaleString() : '—';
                      if (col.key === 'attachments_count') return (Array.isArray(it.attachments_meta) ? it.attachments_meta.length : (Array.isArray(it.attachments) ? it.attachments.length : 0));
                      return it[col.key] || '—';
                    })()}
                  </TableCell>
                ))}
                <TableCell onClick={(e)=>e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={(e)=>{ e.stopPropagation(); onRowOpen?.(it); }}>Details</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4"/></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={()=> onRowAction?.('share', it)}>Share to portal</DropdownMenuItem>
                        <DropdownMenuItem onClick={()=> onRowAction?.('unshare', it)}>Unshare</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && pageItems.length===0 && (
              <TableRow>
                <TableCell colSpan={colDefs.length+1} className="text-center text-sm text-slate-500 py-8">
                  No documents found. Use New Document to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">Page {page} of {totalPages} • {filtered.length} total</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}><ChevronLeft className="w-4 h-4"/></Button>
          <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}><ChevronRight className="w-4 h-4"/></Button>
        </div>
      </div>
    </div>
  );
}