import React from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const SOURCES: { name: string; url: string; docType: string; isRFI?: boolean }[] = [
  { name: "ASI Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/a3b5d4c68_ASI_Template_RichText.txt", docType: "ASI" },
  { name: "CCD Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/64484d66e_CCD_Template_RichText.txt", docType: "CCD" },
  { name: "Field Report Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/b0d01dc72_Field_Report_Template_RichText.txt", docType: "FieldReport" },
  { name: "RFC Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/18b8fbaf3_RFC_Template_RichText.txt", docType: "RFC" },
  { name: "RFI Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/791360543_RFI_Template_RichText.txt", docType: "RFI", isRFI: true },
  { name: "RFP Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/cdfc82cad_RFP_Template_RichText.txt", docType: "RFP" },
  { name: "RFQ Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/2745d5cda_RFQ_Template_RichText.txt", docType: "RFQ" },
  { name: "Submittal Template (Rich Text)", url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/42fc5ccfd_Submittal_Template_RichText.txt", docType: "Submittal" },
];

function rtfToHtml(rtf: string): string {
  if (!rtf) return "";
  let s = rtf;
  // new lines for paragraph
  s = s.replace(/\\par\b/g, "\n");
  // remove RTF control words like \\fsNN, \\b0, \\i0 etc
  s = s.replace(/\\[a-z]+-?\d*/gi, "");
  // remove RTF groups { ... }
  s = s.replace(/\{[^{}]*\}/g, "");
  // cleanup braces
  s = s.replace(/[{}]/g, "");
  // collapse spaces
  s = s.replace(/\s+\n/g, "\n").trim();
  const lines = s.split(/\n+/).map(l=> l.trim()).filter(Boolean);
  return lines.map(l=> `<p>${l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`).join("");
}

export default function TemplateImporter(){
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string>("");

  const run = async () => {
    setLoading(true); setResult("");
    try {
      const payloadsProject: any[] = [];
      const payloadsRFI: any[] = [];
      for (const src of SOURCES) {
        const res = await fetch(src.url); const txt = await res.text();
        const html = rtfToHtml(txt);
        const base = { template_name: src.name, description: "Imported sample", active: true } as any;
        if (src.isRFI) {
          payloadsRFI.push({ ...base, template_body: html });
        } else {
          payloadsProject.push({ ...base, doc_type: src.docType, template_body: html });
        }
      }
      const out: string[] = [];
      if (payloadsProject.length) {
        const created = await (base44 as any).entities.ProjectDocTemplate.bulkCreate(payloadsProject);
        out.push(`ProjectDocTemplate: ${created?.length || 0} created`);
      }
      if (payloadsRFI.length) {
        const createdR = await (base44 as any).entities.RFITemplate.bulkCreate(payloadsRFI);
        out.push(`RFITemplate: ${createdR?.length || 0} created`);
      }
      setResult(out.join(" | "));
    } catch (e: any) {
      setResult(`Error: ${e?.message || e}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={run} disabled={loading}>{loading? 'Importing…' : 'Import Sample Templates'}</Button>
      {result && <div className="text-sm text-slate-600">{result}</div>}
    </div>
  );
}