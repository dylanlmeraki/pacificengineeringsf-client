import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { projectDocsApi } from "@/components/services/projectDocsApiClient";

export default function DocThread({ doc }) {
  const qc = useQueryClient();
  const [text, setText] = React.useState("");

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['doc_messages', doc?.id],
    queryFn: () => projectDocsApi.listMessages(doc.id, 'created_date', 200),
    enabled: !!doc?.id
  });

  const createMsg = useMutation({
    mutationFn: (payload) => projectDocsApi.createMessage(payload),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ['doc_messages', doc?.id] });
    }
  });

  const send = async () => {
    if (!text.trim()) return;
    await createMsg.mutateAsync({ doc_id: doc.id, project_id: doc.project_id, message: text });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="bg-gray-50 border rounded p-2 text-sm">
            {m.message}
          </div>
        ))}
        {messages.length===0 && <div className="text-xs text-gray-500">No messages yet.</div>}
      </div>
      <div className="flex gap-2">
        <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write a message…" />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  );
}