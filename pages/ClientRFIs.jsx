import React from "react";
import { useQuery } from "@tanstack/react-query";
import { rfiApi } from "@/components/services/rfiApiClient";
import RFIView from "@/components/rfi/RFIView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ClientRFIs() {
  const [q, setQ] = React.useState("");
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const { data: rfis = [], refetch } = useQuery({
    queryKey: ['client_rfis', q, me?.email],
    queryFn: async () => {
      if (!me?.email) return [];
      const query = { is_shared_with_client: true, client_email: me.email };
      if (q) query.$text = q;
      return rfiApi.list(query, '-updated_date', 100);
    },
    enabled: !!me?.email
  });

  const [selected, setSelected] = React.useState(null);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Shared RFIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-3">
            <Input placeholder="Search your RFIs" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
          <div className="grid gap-3">
            {rfis.map((rfi)=> (
              <div key={rfi.id} className="border rounded-lg p-4 hover:bg-accent/30 cursor-pointer" onClick={()=>setSelected(rfi)}>
                <div className="font-medium">{rfi.rfi_number || '#'} - {rfi.title}</div>
                <div className="text-xs text-muted-foreground">{rfi.project_name} • Due {rfi.due_date || '—'}</div>
              </div>
            ))}
            {rfis.length === 0 && (
              <div className="text-sm text-muted-foreground">No RFIs shared with you yet.</div>
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