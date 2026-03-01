import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rfiApi } from "@/components/services/rfiApiClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

export default function RFIThread({ rfi }) {
  const qc = useQueryClient();
  const { data: user } = React.useMemo(() => ({ data: null }), []);

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['rfi_messages', rfi?.id],
    queryFn: () => rfiApi.listMessages(rfi.id, 'created_date', 200),
    enabled: !!rfi?.id
  });

  React.useEffect(() => {
    if (!rfi?.id) return;
    const i = setInterval(() => refetch(), 4000);
    return () => clearInterval(i);
  }, [rfi?.id]);

  const [text, setText] = React.useState("");
  const [internalOnly, setInternalOnly] = React.useState(false);
  const createMsg = useMutation({
    mutationFn: (payload) => rfiApi.createMessage(payload),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ['rfi_messages', rfi.id] });
    }
  });

  const send = () => {
    if (!text.trim()) return;
    createMsg.mutate({
      rfi_id: rfi.id,
      project_id: rfi.project_id,
      client_email: rfi.client_email,
      message: text.trim(),
      is_internal: internalOnly,
      is_client_visible: !internalOnly
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-72 overflow-auto mb-3">
          {messages.map((m)=> (
            <div key={m.id} className="bg-accent/30 rounded p-2">
              <div className="text-xs text-muted-foreground">{m.sender_name || m.sender_email || 'User'} • {new Date(m.created_date).toLocaleString?.() || ''}</div>
              <div className="text-sm whitespace-pre-wrap">{m.message}</div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">No messages yet.</div>
          )}
        </div>
        <div className="flex gap-2 items-start">
          <Textarea placeholder="Write a message…" value={text} onChange={(e)=>setText(e.target.value)} />
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              <input type="checkbox" checked={internalOnly} onChange={(e)=>setInternalOnly(e.target.checked)} />
              Internal only
            </label>
            <Button onClick={send}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}