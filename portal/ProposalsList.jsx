import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send,
  DollarSign,
  Calendar,
  MessageSquare,
  Share2,
  Copy,
  Mail,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function ProposalsList({ proposals, onViewProposal }) {
  const [shareProposalId, setShareProposalId] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(null);

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    viewed: "bg-cyan-100 text-cyan-700",
    awaiting_signature: "bg-purple-100 text-purple-700",
    signed: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
    expired: "bg-orange-100 text-orange-700"
  };

  const statusIcons = {
    draft: Clock,
    sent: Send,
    viewed: Eye,
    awaiting_signature: FileText,
    signed: CheckCircle,
    declined: XCircle,
    expired: Clock
  };

  const getProposalUrl = (proposalId) => {
    return `${window.location.origin}/ProposalDashboard?id=${proposalId}`;
  };

  const handleCopyLink = (proposalId) => {
    const url = getProposalUrl(proposalId);
    navigator.clipboard.writeText(url);
    setCopied(proposalId);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShareEmail = async (proposalId) => {
    if (!shareEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setSharing(true);
    try {
      await base44.functions.invoke('shareProposal', {
        proposalId,
        recipientEmail: shareEmail
      });
      toast.success(`Proposal shared with ${shareEmail}`);
      setShareEmail("");
      setShareProposalId(null);
    } catch (error) {
      console.error("Error sharing proposal:", error);
      toast.error("Failed to share proposal");
    }
    setSharing(false);
  };

  if (proposals.length === 0) {
    return (
      <Card className="p-12 text-center border-0 shadow-xl bg-white">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Proposals Yet</h3>
        <p className="text-gray-600">Proposals will appear here once they are created for your projects.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {proposals.map((proposal) => {
        const StatusIcon = statusIcons[proposal.status] || FileText;
        const daysSinceSent = proposal.sent_date 
          ? Math.floor((Date.now() - new Date(proposal.sent_date)) / (1000 * 60 * 60 * 24))
          : 0;

        return (
          <Card key={proposal.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{proposal.title}</h3>
                    <p className="text-sm text-gray-600">#{proposal.proposal_number}</p>
                  </div>
                  <Badge className={statusColors[proposal.status]}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {proposal.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                  {proposal.amount && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-gray-900">
                        ${proposal.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {proposal.sent_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Sent {format(new Date(proposal.sent_date), 'MMM d, yyyy')}
                        {daysSinceSent > 0 && ` (${daysSinceSent}d ago)`}
                      </span>
                    </div>
                  )}
                  {proposal.signed_date && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Signed {format(new Date(proposal.signed_date), 'MMM d')}</span>
                    </div>
                  )}
                </div>

                {proposal.status === 'awaiting_signature' && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800 font-medium">
                      ⏰ Action Required: Please review and sign this proposal
                    </p>
                  </div>
                )}

                {proposal.declined_reason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Declined:</strong> {proposal.declined_reason}
                    </p>
                  </div>
                )}

                {shareProposalId === proposal.id && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Share Proposal</h4>
                    
                    <Button
                      onClick={() => handleCopyLink(proposal.id)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {copied === proposal.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>

                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleShareEmail(proposal.id)}
                        disabled={sharing || !shareEmail.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {sharing ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => onViewProposal(proposal)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View & Discuss
                </Button>
                <Button
                  onClick={() => setShareProposalId(shareProposalId === proposal.id ? null : proposal.id)}
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}