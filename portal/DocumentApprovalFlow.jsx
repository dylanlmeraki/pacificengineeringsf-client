import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileSignature, Loader2 } from "lucide-react";
import SignaturePad from "../proposals/SignaturePad";

export default function DocumentApprovalFlow({ approval, user, onComplete }) {
  const [action, setAction] = useState(null);
  const [comments, setComments] = useState("");
  const [showSignature, setShowSignature] = useState(false);
  const queryClient = useQueryClient();

  const updateApprovalMutation = useMutation({
    mutationFn: async ({ status, signatureData }) => {
      const updateData = {
        status,
        comments,
        approved_date: new Date().toISOString()
      };
      
      if (signatureData) {
        updateData.signature_data = {
          signer_name: user.full_name,
          signer_email: user.email,
          signature_image: signatureData,
          signed_at: new Date().toISOString()
        };
      }
      
      await base44.entities.DocumentApproval.update(approval.id, updateData);
      
      // Notify requester
      await base44.entities.Notification.create({
        recipient_email: approval.requested_by,
        type: 'approval_decision',
        title: `Document Approval ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `${user.full_name} has ${status} your approval request`,
        link: `/ProjectDetail?id=${approval.project_id}`,
        priority: 'high',
        read: false,
        metadata: { approval_id: approval.id, status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-approvals'] });
      if (onComplete) onComplete();
    }
  });

  if (approval.status !== 'pending') {
    return (
      <Card className="p-4 border-2 border-gray-300 bg-gray-50">
        <div className="flex items-center gap-3">
          {approval.status === 'approved' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <div>
            <h4 className="font-bold text-gray-900">
              {approval.status === 'approved' ? 'Approved' : 'Rejected'}
            </h4>
            <p className="text-sm text-gray-600">
              Decision made on {new Date(approval.approved_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        {approval.comments && (
          <p className="text-sm text-gray-700 mt-3 pl-8">{approval.comments}</p>
        )}
      </Card>
    );
  }

  if (updateApprovalMutation.isPending) {
    return (
      <Card className="p-8 text-center border-2 border-blue-300 bg-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-gray-700">Processing your decision...</p>
      </Card>
    );
  }

  const handleApprove = () => {
    setAction('approve');
    setShowSignature(true);
  };

  const handleReject = () => {
    if (!comments.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    updateApprovalMutation.mutate({ status: 'rejected', signatureData: null });
  };

  const handleSignature = (signatureData) => {
    updateApprovalMutation.mutate({ status: 'approved', signatureData });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 border-2 border-blue-300 bg-blue-50">
        <div className="flex items-start gap-3">
          <FileSignature className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">Approval Required</h4>
            <p className="text-sm text-gray-700 mb-3">
              Requested by {approval.requested_by.split('@')[0]} for {approval.approval_type}
            </p>
            {!action && (
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => setAction('reject')}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {action === 'reject' && (
        <Card className="p-4 border-2 border-red-300 bg-red-50">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reason for Rejection *
          </label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Please explain why you're rejecting this..."
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleReject}
              disabled={!comments.trim()}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Rejection
            </Button>
            <Button
              onClick={() => setAction(null)}
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {action === 'approve' && !showSignature && (
        <Card className="p-4 border-2 border-green-300 bg-green-50">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Comments (Optional)
          </label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any notes..."
            className="mb-3"
          />
          <Button
            onClick={() => setShowSignature(true)}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            Continue to Signature
          </Button>
        </Card>
      )}

      {showSignature && (
        <SignaturePad
          onSave={handleSignature}
          onCancel={() => {
            setShowSignature(false);
            setAction(null);
          }}
        />
      )}
    </div>
  );
}