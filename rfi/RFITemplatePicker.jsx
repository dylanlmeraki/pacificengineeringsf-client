import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PRESET_TEMPLATES = [
  {
    template_name: "Classic Minimal",
    description: "Clean sections for question/response and references",
    preview_image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/ad5950dca_image.png"
  },
  {
    template_name: "MEP Style",
    description: "Spec/drawing fields, cost & schedule impact",
    preview_image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/9c0a81592_image.png"
  },
  {
    template_name: "General Sheet",
    description: "Smartsheet-style general construction RFI",
    preview_image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/03a3448a1_image.png"
  },
  {
    template_name: "Simple Construction",
    description: "Concise request/response with party details",
    preview_image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/4a2098d4e_image.png"
  },
  {
    template_name: "Tracking Log",
    description: "Spreadsheet-style RFI log & status",
    preview_image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/876f56b9a_image.png"
  },
  {
    template_name: "Response Template",
    description: "Formal response & background sections",
    preview_image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/e4dc5d8e7_image.png"
  }
];

export default function RFITemplatePicker({ value, onChange }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {PRESET_TEMPLATES.map((t) => (
        <Card key={t.template_name} className={value === t.template_name ? "ring-2 ring-indigo-500" : ""}>
          <CardHeader>
            <CardTitle className="text-base">{t.template_name}</CardTitle>
            <p className="text-xs text-muted-foreground">{t.description}</p>
          </CardHeader>
          <CardContent>
            <img src={t.preview_image} alt={t.template_name} className="w-full h-40 object-cover rounded" />
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={() => onChange(t.template_name)}>Use Template</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}