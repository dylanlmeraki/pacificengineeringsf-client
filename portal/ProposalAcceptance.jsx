import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileSignature, MessageSquare, Loader2, AlertTriangle } from "lucide-react";
import SignaturePad from "../proposals/SignaturePad";

export default function ProposalAcceptance({ proposal, user, onComplete }) {
  const [action, setAction] = useState(null); // 'accept' or 'reject'
  const [showSignature, setShowSignature] = useState(false);
  const [comments, setComments] = useState("");
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const updateProposalMutation = useMutation({
    mutationFn: async ({ status, signatureData, clientComments }) => {
      const updateData = {
        status,
        client_comments: clientComments,
        [status === 'signed' ? 'signed_date' : 'declined_date']: new Date().toISOString()
      };

      if (status === 'signed') {
        updateData.signature_data = {
          signer_name: user.full_name,
          signer_email: user.email,
          signature_image: signatureData,
          ip_address: 'client',
          signed_at: new Date().toISOString()
        };
      }

      if (status === 'declined') {
        updateData.declined_reason = clientComments;
      }

      await base44.entities.Proposal.update(proposal.id, updateData);

      // Create notification for admins
      const adminUsers = await base44.entities.User.filter({ role: 'admin' });
      for (const admin of adminUsers) {
        await base44.entities.Notification.create({
          recipient_email: admin.email,
          type: 'proposal_status',
          title: `Proposal ${status === 'signed' ? 'Accepted' : 'Declined'}`,
          message: `${user.full_name} has ${status === 'signed' ? 'accepted' : 'declined'} proposal: ${proposal.title}`,
          link: `/ProposalDashboard`,
          priority: status === 'signed' ? 'high' : 'normal',
          read: false,
          metadata: {
            proposal_id: proposal.id,
            client_email: user.email,
            action: status
          }
        });
      }

      // Send confirmation email
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Proposal ${status === 'signed' ? 'Accepted' : 'Declined'} - ${proposal.title}`,
        body: `
          <h2>Proposal ${status === 'signed' ? 'Acceptance' : 'Declination'} Confirmation</h2>
          <p>Dear ${user.full_name},</p>
          <p>This confirms that you have ${status === 'signed' ? 'accepted' : 'declined'} the following proposal:</p>
          <ul>
            <li><strong>Proposal:</strong> ${proposal.title}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
            ${clientComments ? `<li><strong>Comments:</strong> ${clientComments}</li>` : ''}
          </ul>
          <p>${status === 'signed' ? 'Our team will begin work on your project shortly.' : 'Thank you for considering our proposal. We appreciate your time.'}</p>
          <p>Best regards,<br>Pacific Engineering Team</p>
        `
      });

      return updateData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['client-proposals'] });
      if (onComplete) onComplete();
    },
    onError: (error) => {
      console.error("Proposal update error:", error);
      setError(error.message || "Failed to update proposal. Please try again.");
    }
  });

  // Prevent duplicate submissions
  if (proposal.status === 'signed' || proposal.status === 'declined') {
    return (
      <Card className="p-6 border-2 border-gray-300 bg-gray-50">
        <div className="flex items-center gap-3 mb-4">
          {proposal.status === 'signed' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
          <div>
            <h4 className="font-bold text-gray-900">
              Proposal Already {proposal.status === 'signed' ? 'Accepted' : 'Declined'}
            </h4>
            <p className="text-sm text-gray-600">
              This action was completed on {new Date(proposal[proposal.status === 'signed' ? 'signed_date' : 'declined_date']).toLocaleDateString()}
            </p>
          </div>
        </div>

        {proposal.client_comments && (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">Your Comments:</p>
            <p className="text-sm text-gray-600">{proposal.client_comments}</p>
          </div>
        )}
      </Card>
    );
  }

  if (updateProposalMutation.isPending) {
    return (
      <Card className="p-12 text-center border-2 border-blue-300 bg-blue-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h4 className="font-bold text-gray-900 mb-2">Processing Your Response...</h4>
        <p className="text-sm text-gray-600">Please wait while we record your decision.</p>
      </Card>
    );
  }

  const handleAccept = () => {
    setAction('accept');
    setShowSignature(true);
    setError(null);
  };

  const handleReject = () => {
    setAction('reject');
    setError(null);
  };

  const handleSignature = (signatureData) => {
    updateProposalMutation.mutate({
      status: 'signed',
      signatureData,
      clientComments: comments
    });
  };

  const confirmReject = () => {
    if (!comments.trim()) {
      setError("Please provide a reason for declining this proposal.");
      return;
    }
    
    updateProposalMutation.mutate({
      status: 'declined',
      signatureData: null,
      clientComments: comments
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <FileSignature className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Action Required</h3>
            <p className="text-gray-700 mb-4">
              Please review this proposal and either accept or decline. Your decision will be recorded with a timestamp and optional comments.
            </p>
            
            {!action && (
              <div className="flex gap-3">
                <Button
                  onClick={handleAccept}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Proposal
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline Proposal
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-2 border-red-300 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {action === 'accept' && !showSignature && (
        <Card className="p-6 border-2 border-green-300 bg-green-50">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Additional Comments (Optional)
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any notes or comments about your acceptance..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => setShowSignature(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Continue to Signature
            </Button>
          </div>
        </Card>
      )}

      {action === 'accept' && showSignature && (
        <SignaturePad
          onSave={handleSignature}
          onCancel={() => {
            setShowSignature(false);
            setAction(null);
          }}
        />
      )}

      {action === 'reject' && (
        <Card className="p-6 border-2 border-red-300 bg-red-50">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reason for Declining (Required)
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Please let us know why you're declining this proposal..."
              className="min-h-[120px]"
              required
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setAction(null);
                setComments("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!comments.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Confirm Decline
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}