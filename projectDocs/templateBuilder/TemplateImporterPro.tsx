import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Types
export type DocType = "RFQ" | "RFP" | "Submittal" | "ASI" | "CCD" | "RFC" | "FieldReport" | "RFI";

export type Source = {
  id: string;
  name: string;
  url: string;
  docType: DocType;
};

const SOURCES: Source[] = [
  { id: "ASI", name: "ASI Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/7e6b36ec4_ASI_Template_RichText.txt", docType: "ASI" },
  { id: "CCD", name: "CCD Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/815b0ac9f_CCD_Template_RichText.txt", docType: "CCD" },
  { id: "FieldReport", name: "Field Report Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/306fbb908_Field_Report_Template_RichText.txt", docType: "FieldReport" },
  { id: "RFC", name: "RFC Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/0dfd3e291_RFC_Template_RichText.txt", docType: "RFC" },
  { id: "RFI", name: "RFI Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/6ae01765a_RFI_Template_RichText.txt", docType: "RFI" },
  { id: "RFP", name: "RFP Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/2ee7ae1af_RFP_Template_RichText.txt", docType: "RFP" },
  { id: "RFQ", name: "RFQ Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/202462277_RFQ_Template_RichText.txt", docType: "RFQ" },
  { id: "Submittal", name: "Submittal Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/77f013e66_Submittal_Template_RichText.txt", docType: "Submittal" },
];

function rtfToHtmlMinimal(rtf: string): string {
  let s = rtf;
  s = s.replace(/\{\\rtf[\s\S]*?\n/, "");
  s = s.replace(/\\'([0-9a-fA-F]{2})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
  s = s.replace(/\\par\b/g, "<br/>");
  s = s.replace(/\\[a-zA-Z]+-?\d*\s?/g, "");
  s = s.replace(/[{}]/g, "");
  s = s.replace(/\[[^\]]+\]/g, (m) => `<strong>${m}</strong>`);
  return `<div>${s}</div>`;
}

function groupByDocType(items: Source[]): Record<DocType, Source[]> {
  return items.reduce((acc, it) => {
    if (!(it.docType in acc)) (acc as any)[it.docType] = [];
    (acc as any)[it.docType].push(it);
    return acc;
  }, { RFQ: [], RFP: [], Submittal: [], ASI: [], CCD: [], RFC: [], FieldReport: [], RFI: [] } as Record<DocType, Source[]>);
}

type ConflictPolicy = "append" | "overwrite";

type Summary = { updated: number; created: number; failed: number };

type Progress = { done: number; total: number };

export default function TemplateImporterPro(): JSX.Element {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [policy, setPolicy] = React.useState<ConflictPolicy>("append");
  const [filter, setFilter] = React.useState<DocType | "ALL">("ALL");
  const [importing, setImporting] = React.useState(false);
  const [progress, setProgress] = React.useState<Progress>({ done: 0, total: 0 });
  const [summary, setSummary] = React.useState<Summary>({ updated: 0, created: 0, failed: 0 });

  const grouped = groupByDocType(SOURCES);
  const visible: Source[] = filter === "ALL" ? SOURCES : grouped[filter];

  const toggleAllVisible = (checked: boolean) => {
    const next = { ...selected };
    visible.forEach((s) => (next[s.id] = checked));
    setSelected(next);
  };

  const computeUniqueName = (base: string, existing: Set<string>) => {
    if (!existing.has(base)) return base;
    let n = 2;
    while (existing.has(`${base} (v${n})`)) n += 1;
    return `${base} (v${n})`;
  };

  const handleImport = async () => {
    const chosen = SOURCES.filter((s) => selected[s.id]);
    if (!chosen.length) return;

    setImporting(true);
    setSummary({ updated: 0, created: 0, failed: 0 });
    setProgress({ done: 0, total: chosen.length });

    // Fetch existing once (idempotent friendly)
    const existingPD = await base44.entities.ProjectDocTemplate.list();
    const existingPDNames = new Set((existingPD || []).map((t: any) => t.template_name));
    const existingRFI = await base44.entities.RFITemplate.list();
    const existingRFINames = new Set((existingRFI || []).map((t: any) => t.template_name));

    let updated = 0, created = 0, failed = 0;

    for (const src of chosen) {
      try {
        const res = await fetch(src.url);
        const text = await res.text();
        const html = rtfToHtmlMinimal(text);

        if (src.docType === "RFI") {
          let name = src.name;
          const exists = (existingRFI || []).find((t: any) => t.template_name === name);
          if (policy === "append" && exists) {
            name = computeUniqueName(name, existingRFINames);
          }
          const values: any = { template_name: name, template_body: html, active: true };
          if (policy === "overwrite" && exists) {
            await base44.entities.RFITemplate.update(exists.id, values);
            updated += 1;
          } else {
            await base44.entities.RFITemplate.create(values);
            existingRFINames.add(name);
            created += 1;
          }
        } else {
          let name = src.name;
          const exists = (existingPD || []).find((t: any) => t.template_name === name && t.doc_type === src.docType);
          if (policy === "append" && exists) {
            name = computeUniqueName(name, existingPDNames);
          }
          const values: any = {
            template_name: name,
            doc_type: src.docType,
            field_sections: [],
            template_body: html,
            active: true,
          };
          if (policy === "overwrite" && exists) {
            await base44.entities.ProjectDocTemplate.update(exists.id, values);
            updated += 1;
          } else {
            await base44.entities.ProjectDocTemplate.create(values);
            existingPDNames.add(name);
            created += 1;
          }
        }
      } catch (e) {
        console.error("Import failed for", src.name, e);
        failed += 1;
      } finally {
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }
    }

    setSummary({ updated, created, failed });
    setImporting(false);
  };

  return (
    <Card className="bg-white/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Import Sample Templates</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {(["RFQ","RFP","Submittal","ASI","CCD","RFC","FieldReport","RFI"] as DocType[]).map((dt) => (
                <SelectItem key={dt} value={dt}>{dt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={policy} onValueChange={(v) => setPolicy(v as ConflictPolicy)}>
            <SelectTrigger className="w-44 h-8">
              <SelectValue placeholder="On name conflict" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="append">Append version</SelectItem>
              <SelectItem value="overwrite">Overwrite existing</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline" onClick={() => toggleAllVisible(true)}>Select all</Button>
          <Button size="sm" variant="outline" onClick={() => toggleAllVisible(false)}>Clear</Button>
          <Button size="sm" onClick={handleImport} disabled={importing}>
            {importing ? `Importing… ${progress.done}/${progress.total}` : "Import Selected"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((s) => (
            <label key={s.id} className="flex items-center gap-3 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
              <Checkbox checked={!!selected[s.id]} onCheckedChange={(c) => setSelected({ ...selected, [s.id]: !!c })} />
              <div className="min-w-0">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-slate-500 truncate">{s.url.split("/").pop()}</div>
              </div>
              <Badge className="ml-auto" variant="secondary">{s.docType}</Badge>
            </label>
          ))}
        </div>

        {(progress.total > 0 || summary.created + summary.updated + summary.failed > 0) && (
          <div className="mt-3 text-sm text-slate-600">
            {importing ? (
              <div>Progress: {progress.done}/{progress.total}</div>
            ) : (
              <div className="flex gap-4">
                <span>Created: <strong>{summary.created}</strong></span>
                <span>Updated: <strong>{summary.updated}</strong></span>
                <span>Failed: <strong className="text-red-600">{summary.failed}</strong></span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}