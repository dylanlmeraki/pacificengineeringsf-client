import React from "react";
import { useQuery } from "@tanstack/react-query";
import { rfiApi } from "@/components/services/rfiApiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Filter } from "lucide-react";

const statusColor = (s) => ({
  draft: "bg-gray-100 text-gray-700",
  pending_approval: "bg-amber-100 text-amber-800",
  shared_with_client: "bg-blue-100 text-blue-800",
  answered: "bg-green-100 text-green-800",
  closed: "bg-slate-200 text-slate-700"
}[s] || "bg-slate-100 text-slate-700");

export default function RFIList({ onCreate, onOpen }) {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");

  const { data: rfis = [], refetch, isLoading } = useQuery({
    queryKey: ['rfis', q, status],
    queryFn: async () => {
      const query = {};
      if (q) query.$text = q;
      if (status !== 'all') query.status = status;
      return rfiApi.list(query, '-updated_date', 100);
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>RFIs</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}><Filter className="w-4 h-4" /> Refresh</Button>
          <Button onClick={onCreate}><Plus className="w-4 h-4" /> New RFI</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <Input placeholder="Search title, number, project" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="border rounded-md px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="shared_with_client">Shared with Client</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="grid gap-3">
          {rfis.map((rfi)=> (
            <div key={rfi.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rfi.rfi_number || '#'} - {rfi.title}</span>
                  <Badge className={statusColor(rfi.status)}>{rfi.status.replaceAll('_',' ')}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{rfi.project_name} • Due {rfi.due_date || '—'}</div>
              </div>
              <Button variant="ghost" onClick={()=>onOpen?.(rfi)}><Eye className="w-4 h-4" /></Button>
            </div>
          ))}
          {(!isLoading && rfis.length === 0) && (
            <div className="text-sm text-muted-foreground">No RFIs found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}