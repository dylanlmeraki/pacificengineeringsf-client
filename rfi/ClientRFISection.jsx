import React from "react";
import { useQuery } from "@tanstack/react-query";
import { rfiApi } from "@/components/services/rfiApiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RFIView from "./RFIView";

export default function ClientRFISection({ user }) {
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState(null);

  const { data: rfis = [], refetch, isLoading } = useQuery({
    queryKey: ['client_rfis_tab', q, user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const query = { is_shared_with_client: true, client_email: user.email };
      if (q) query.$text = q;
      return rfiApi.list(query, '-updated_date', 100);
    },
    enabled: !!user?.email
  });

  return (
    <div className="space-y-4">
      <Card className="p-4 border-0 shadow-lg">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-xl">RFIs Shared With You</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex gap-3 mb-3">
            <Input placeholder="Search RFIs by title, number, project" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
          <div className="grid gap-3">
            {rfis.map((rfi)=> (
              <div key={rfi.id} className="border rounded-lg p-4 hover:bg-accent/30 cursor-pointer" onClick={()=>setSelected(rfi)}>
                <div className="font-medium">{rfi.rfi_number || '#'} - {rfi.title}</div>
                <div className="text-xs text-muted-foreground">{rfi.project_name} • Due {rfi.due_date || '—'}</div>
              </div>
            ))}
            {(!isLoading && rfis.length === 0) && (
              <div className="text-sm text-muted-foreground">No RFIs shared yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {selected && (
        <RFIView rfi={selected} onRefresh={refetch} />
      )}
    </div>
  );
}