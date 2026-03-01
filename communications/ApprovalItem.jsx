import React from 'react';
import { Button } from '@/components/ui/button';

export default function ApprovalItem({ approval, onApprove, onSkip }) {
  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm text-gray-500">Scheduled: {approval.scheduled_send_at ? new Date(approval.scheduled_send_at).toLocaleString() : 'Now'}</div>
          <h4 className="font-semibold">{approval.subject}</h4>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{approval.send_via}</div>
      </div>
      <div className="prose prose-sm max-w-none border rounded-md p-3 bg-gray-50" dangerouslySetInnerHTML={{ __html: approval.body_html }} />
      <div className="flex justify-end gap-2 mt-3">
        <Button variant="outline" onClick={()=>onSkip(approval)}>Skip</Button>
        <Button onClick={()=>onApprove(approval)}>Approve & Send</Button>
      </div>
    </div>
  );
}