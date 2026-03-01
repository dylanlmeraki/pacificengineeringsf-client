import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ApprovalItem from '@/components/communications/ApprovalItem';
import { approveAndSendOutreach } from "@/functions/approveAndSendOutreach";

export default function OutreachQueue() {
  const { data: approvals = [], refetch } = useQuery({ queryKey: ['outreach-approvals'], queryFn: ()=> base44.entities.OutreachApproval.filter({ status: 'pending' }, '-scheduled_send_at', 100), initialData: [] });

  const approve = async (a)=>{ await approveAndSendOutreach({ approval_id: a.id }); await refetch(); };
  const skip = async (a)=>{ await base44.entities.OutreachApproval.update(a.id, { status: 'skipped' }); await refetch(); };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Outreach Approvals</h1>
        <Button variant="outline" onClick={()=>refetch()}>Refresh</Button>
      </div>

      {approvals.length === 0 ? (
        <Card className="p-6 text-gray-500">No pending approvals.</Card>
      ) : (
        <div className="grid gap-4">
          {approvals.map(a => (
            <ApprovalItem key={a.id} approval={a} onApprove={approve} onSkip={skip} />
          ))}
        </div>
      )}
    </div>
  );
}