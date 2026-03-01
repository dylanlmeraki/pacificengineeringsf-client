import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Share2, CheckCircle2 } from "lucide-react";
import { rfiApi } from "@/components/services/rfiApiClient";
import RFIThread from "./RFIThread";

const statusColor = (s) => ({
  draft: "bg-gray-100 text-gray-700",
  pending_approval: "bg-amber-100 text-amber-800",
  shared_with_client: "bg-blue-100 text-blue-800",
  answered: "bg-green-100 text-green-800",
  closed: "bg-slate-200 text-slate-700"
}[s] || "bg-slate-100 text-slate-700");

export default function RFIView({ rfi, onRefresh }) {
  if (!rfi) return null;

  const share = async () => {
    await rfiApi.update(rfi.id, { is_shared_with_client: true, status: 'shared_with_client' });
    onRefresh?.();
  };
  const markAnswered = async () => {
    await rfiApi.update(rfi.id, { status: 'answered' });
    onRefresh?.();
  };
  const submitForApproval = async () => {
    await rfiApi.update(rfi.id, { status: 'pending_approval' });
    onRefresh?.();
  };
  const approveAndShare = async () => {
    await rfiApi.update(rfi.id, { status: 'shared_with_client', is_shared_with_client: true });
    onRefresh?.();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{rfi.rfi_number || '#'} - {rfi.title}</CardTitle>
            <Badge className={statusColor(rfi.status)}>{rfi.status.replaceAll('_',' ')}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm"><span className="font-medium">Project:</span> {rfi.project_name || rfi.project_id}</div>
              <div className="text-sm"><span className="font-medium">Due:</span> {rfi.due_date || '—'}</div>
              <div className="text-sm"><span className="font-medium">Spec:</span> {rfi.spec_section || '—'} • <span className="font-medium">Drawing:</span> {rfi.drawing_no || '—'} • <span className="font-medium">Detail:</span> {rfi.detail_no || '—'}</div>
              <div className="text-sm"><span className="font-medium">Client:</span> {rfi.client_email || '—'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm"><span className="font-medium">Cost Impact:</span> {rfi.cost_impact} {rfi.cost_amount? `$${rfi.cost_amount}`: ''}</div>
              <div className="text-sm"><span className="font-medium">Schedule Impact:</span> {rfi.schedule_impact} {rfi.schedule_days? `${rfi.schedule_days} days`: ''}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {rfi.status === 'draft' && (
                  <Button variant="outline" onClick={submitForApproval}>Submit for approval</Button>
                )}
                {rfi.status === 'pending_approval' && (
                  <Button variant="outline" onClick={approveAndShare}><Share2 className="w-4 h-4" /> Approve & Share</Button>
                )}
                {rfi.status !== 'shared_with_client' && rfi.status !== 'pending_approval' && (
                  <Button variant="outline" onClick={share}><Share2 className="w-4 h-4" /> Share with client</Button>
                )}
                <Button variant="outline" onClick={markAnswered}><CheckCircle2 className="w-4 h-4" /> Mark answered</Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold mb-1">Request / Clarification</div>
            <div className="text-sm whitespace-pre-wrap bg-accent/30 rounded p-3">{rfi.question}</div>
          </div>

          {rfi.response && (
            <div className="mt-4">
              <div className="text-sm font-semibold mb-1">Response</div>
              <div className="text-sm whitespace-pre-wrap bg-accent/30 rounded p-3">{rfi.response}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <RFIThread rfi={rfi} />
    </div>
  );
}