import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ListChecks } from "lucide-react";

const ITEMS = [
  "Upload doc (client) → internal sees it",
  "Add annotation → visible and resolvable",
  "Request approval → approve/deny/sign & notify",
  "Start chat from project → messages persist",
  "Create/send invoice → status and activity update"
];

export default function QAChecklist() {
  return (
    <Card className="p-6 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-gray-900 flex items-center gap-2"><ListChecks className="w-5 h-5" /> QA Checklist</div>
        <Badge variant="outline">Manual run-through</Badge>
      </div>
      <ul className="space-y-2 text-sm text-gray-700">
        {ITEMS.map((t, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {t}
          </li>
        ))}
      </ul>
    </Card>
  );
}