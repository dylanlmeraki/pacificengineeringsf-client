import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket, BellRing, Clock } from "lucide-react";
import { sendApprovalNotification } from "@/functions/sendApprovalNotification";
import { sendOverdueReminder } from "@/functions/sendOverdueReminder";

export default function FunctionTester() {
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['ft-docs'],
    queryFn: async () => await base44.entities.ProjectDoc.list('-created_date', 200),
    initialData: []
  });
  const [docId, setDocId] = useState("");
  const selected = useMemo(() => docs.find(d => d.id === docId) || null, [docs, docId]);
  const [running, setRunning] = useState(null);

  const callFn = async (name, payload) => {
    setRunning(name);
    try {
      const fnMap = {
        sendApprovalNotification,
        sendOverdueReminder,
      };
      const fn = fnMap[name];
      if (!fn) throw new Error(`Function not found: ${name}`);
      await fn(payload);
    } finally {
      setRunning(null);
    }
  };

  return (
    <Card className="p-6 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-gray-900 flex items-center gap-2"><Rocket className="w-5 h-5" /> Backend Function Tester</div>
        <Badge variant="outline">Docs loaded: {docs.length}</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <div className="text-sm text-gray-700 mb-1">Select Document (for approval/reminder tests)</div>
          <Select value={docId} onValueChange={setDocId}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder={isLoading ? 'Loading...' : 'Choose a document'} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {docs.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.title || d.doc_number || `Doc ${String(d.id).slice(-4)}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => callFn('sendApprovalNotification', { data: { doc_id: docId } })}
            disabled={!docId || running === 'sendApprovalNotification'}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {running === 'sendApprovalNotification' ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />} Send Approval
          </Button>
          <Button
            onClick={() => callFn('sendOverdueReminder', { data: { doc_id: docId } })}
            disabled={!docId || running === 'sendOverdueReminder'}
            variant="outline"
          >
            {running === 'sendOverdueReminder' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />} Overdue Reminder
          </Button>
        </div>
      </div>
    </Card>
  );
}