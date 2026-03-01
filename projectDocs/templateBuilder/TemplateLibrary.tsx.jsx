import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TemplateLibrary(): JSX.Element {
  const { data: pd = [], refetch: refetchPD } = useQuery({
    queryKey: ["ProjectDocTemplate"],
    queryFn: () => base44.entities.ProjectDocTemplate.list("-updated_date", 500),
    initialData: [],
  });
  const { data: rfi = [], refetch: refetchRFI } = useQuery({
    queryKey: ["RFITemplate"],
    queryFn: () => base44.entities.RFITemplate.list("-updated_date", 500),
    initialData: [],
  });

  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<string | "ALL">("ALL");

  const items = React.useMemo(() => {
    const mapped = [
      ...pd.map((t: any) => ({ id: t.id, name: t.template_name, type: t.doc_type || "ProjectDoc", updated: t.updated_date, active: t.active })),
      ...rfi.map((t: any) => ({ id: t.id, name: t.template_name, type: "RFI", updated: t.updated_date, active: t.active })),
    ];
    return mapped
      .filter((x) => (type === "ALL" || x.type === type))
      .filter((x) => x.name?.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => String(b.updated || "").localeCompare(String(a.updated || "")));
  }, [pd, rfi, q, type]);

  const duplicates = React.useMemo(() => {
    const seen = new Set<string>();
    const dups = new Set<string>();
    for (const t of items) {
      const key = `${t.type}::${t.name}`;
      if (seen.has(key)) dups.add(key); else seen.add(key);
    }
    return dups;
  }, [items]);

  return (
    <Card className="bg-white/80">
      <CardHeader className="flex items-center justify-between flex-row">
        <CardTitle className="text-base">Template Library</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="Search templates…" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-48" />
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="RFQ">RFQ</SelectItem>
              <SelectItem value="RFP">RFP</SelectItem>
              <SelectItem value="Submittal">Submittal</SelectItem>
              <SelectItem value="ASI">ASI</SelectItem>
              <SelectItem value="CCD">CCD</SelectItem>
              <SelectItem value="RFC">RFC</SelectItem>
              <SelectItem value="FieldReport">FieldReport</SelectItem>
              <SelectItem value="RFI">RFI</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => { refetchPD(); refetchRFI(); }}>Refresh</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((t) => (
            <div key={`${t.type}-${t.id}`} className="border rounded-lg p-3 bg-white hover:shadow-sm transition">
              <div className="flex items-center gap-2">
                <div className="font-medium truncate" title={t.name}>{t.name}</div>
                <Badge variant="secondary" className="ml-auto">{t.type}</Badge>
              </div>
              <div className="mt-1 text-xs text-slate-500">{t.updated ? new Date(t.updated).toLocaleString() : ""}</div>
              <div className="mt-2 flex gap-2">
                <Badge className={t.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}>{t.active ? "Active" : "Inactive"}</Badge>
                {duplicates.has(`${t.type}::${t.name}`) && (
                  <Badge className="bg-amber-100 text-amber-800">Duplicate name</Badge>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center text-sm text-slate-500 py-6">No templates found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}