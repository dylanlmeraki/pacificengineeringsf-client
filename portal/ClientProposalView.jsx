import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  Download, 
  CheckCircle2, 
  PenSquare, 
  XCircle, 
  Clock,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import DocumentSigner from "./DocumentSigner";
import ProposalDiscussion from "./ProposalDiscussion";

export default function ClientProposalView({ proposal, onClose, onBack }) {
  const [showDocumentSigner, setShowDocumentSigner] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const updateProposalMutation = useMutation({
    mutationFn: ({ id, updates }) => base44.entities.Proposal.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['client-proposals']);
    }
  });

  const handleDecline = () => {
    if (!declineReason.trim()) {
      alert("Please provide a reason for declining");
      return;
    }

    updateProposalMutation.mutate({
      id: proposal.id,
      updates: {
        status: "declined",
        declined_date: new Date().toISOString(),
        declined_reason: declineReason
      }
    });

    setShowDecline(false);
  };

  const handleSignComplete = () => {
    queryClient.invalidateQueries(['client-proposals']);
    setShowDocumentSigner(false);
    setTimeout(() => {
      if (onBack) onBack();
    }, 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([proposal.content_html], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${proposal.proposal_number || 'proposal'}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    viewed: "bg-cyan-100 text-cyan-700",
    awaiting_signature: "bg-purple-100 text-purple-700",
    signed: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
    expired: "bg-orange-100 text-orange-700"
  };

  const needsSignature = ['sent', 'viewed', 'awaiting_signature'].includes(proposal.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-8 px-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Proposals
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-blue-100">
              Proposal #{proposal.proposal_number}
            </span>
            <Badge className={statusColors[proposal.status]}>
              {proposal.status.replace(/_/g, ' ')}
            </Badge>
            {proposal.amount && (
              <span className="text-lg font-semibold">
                ${proposal.amount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Proposal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                {proposal.sent_date && (
                  <div>
                    <span className="text-gray-600">Sent:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {format(new Date(proposal.sent_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                {proposal.signed_date && (
                  <div>
                    <span className="text-gray-600">Signed:</span>
                    <span className="ml-2 font-medium text-green-700">
                      {format(new Date(proposal.signed_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                {proposal.expiration_date && (
                  <div>
                    <span className="text-gray-600">Expires:</span>
                    <span className="ml-2 font-medium text-orange-700">
                      {format(new Date(proposal.expiration_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {proposal.status === 'awaiting_signature' && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900">Action Required</p>
                    <p className="text-sm text-purple-700">Please review and sign this proposal below</p>
                  </div>
                </div>
              </div>
            )}

            {proposal.signature_data && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">
                      Signed by {proposal.signature_data.signer_name}
                    </p>
                    <p className="text-sm text-green-700">({proposal.signature_data.signer_email})</p>
                  </div>
                </div>
              </div>
            )}

            {proposal.declined_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Declined</p>
                    <p className="text-sm text-red-700">{proposal.declined_reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Proposal Content */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: proposal.content_html }}
              />
            </div>

            {/* Document Signer */}
            {needsSignature && user && (
              showDocumentSigner ? (
                <DocumentSigner
                  documentId={proposal.id}
                  documentType="proposal"
                  projectId={proposal.project_id}
                  signerName={user.full_name}
                  signerEmail={user.email}
                  onSignComplete={handleSignComplete}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    {!showDecline && (
                      <>
                        <Button onClick={() => setShowDocumentSigner(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                          <PenSquare className="w-4 h-4 mr-2" />
                          Sign Proposal
                        </Button>
                        <Button onClick={() => setShowDecline(true)} className="bg-red-600 hover:bg-red-700">
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Decline Section */}
            {showDecline && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-500">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Decline Proposal
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Declining *
                    </label>
                    <Textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Please let us know why you're declining this proposal..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleDecline}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Submit Decline
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDecline(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Discussion */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <ProposalDiscussion proposalId={proposal.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}