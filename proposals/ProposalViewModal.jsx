import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Download, Send, CheckCircle, Mail, PenTool, XCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import SignaturePad from "./SignaturePad";

export default function ProposalViewModal({ proposal, onClose, onUpdate }) {
  const [isSending, setIsSending] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [sendingReminder, setSendingReminder] = useState(false);
  const [signaturePad, setSignaturePad] = useState(null);

  const handleMarkSent = () => {
    onUpdate({
      status: "sent",
      sent_date: new Date().toISOString()
    });
  };

  const handleInitiateSignature = () => {
    setShowSignature(true);
    onUpdate({
      status: "awaiting_signature"
    });
  };

  const handleSubmitSignature = async () => {
    if (!signerName || !signerEmail || !signaturePad || signaturePad.isEmpty) {
      alert("Please fill in all fields and provide a signature");
      return;
    }

    const signatureImage = signaturePad.toDataURL();

    onUpdate({
      status: "signed",
      signed_date: new Date().toISOString(),
      signature_data: {
        signer_name: signerName,
        signer_email: signerEmail,
        signature_image: signatureImage,
        signed_at: new Date().toISOString()
      }
    });

    setShowSignature(false);
  };

  const handleDecline = () => {
    if (!declineReason.trim()) {
      alert("Please provide a reason for declining");
      return;
    }

    onUpdate({
      status: "declined",
      declined_date: new Date().toISOString(),
      declined_reason: declineReason
    });

    setShowDecline(false);
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      await base44.functions.invoke('sendProposalReminder', { proposal_id: proposal.id });
      alert("Reminder sent successfully!");
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder");
    }
    setSendingReminder(false);
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

  const canSign = ['sent', 'viewed', 'awaiting_signature'].includes(proposal.status);
  const canSendReminder = ['sent', 'viewed', 'awaiting_signature'].includes(proposal.status);
  const daysSinceSent = proposal.sent_date ? Math.floor((Date.now() - new Date(proposal.sent_date)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{proposal.title}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Proposal #{proposal.proposal_number}
                </span>
                <Badge className={statusColors[proposal.status]}>
                  {proposal.status}
                </Badge>
                {proposal.amount && (
                  <span className="text-sm font-semibold text-green-700">
                    ${proposal.amount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Metadata */}
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            {proposal.created_date && (
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {format(new Date(proposal.created_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {proposal.sent_date && (
              <div>
                <span className="text-gray-600">Sent:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {format(new Date(proposal.sent_date), 'MMM d, yyyy')}
                  {daysSinceSent > 0 && (
                    <span className="text-gray-500"> ({daysSinceSent}d ago)</span>
                  )}
                </span>
              </div>
            )}
            {proposal.viewed_date && (
              <div>
                <span className="text-gray-600">Viewed:</span>
                <span className="ml-2 font-medium text-cyan-700">
                  {format(new Date(proposal.viewed_date), 'MMM d, yyyy')}
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
            {proposal.declined_date && (
              <div>
                <span className="text-gray-600">Declined:</span>
                <span className="ml-2 font-medium text-red-700">
                  {format(new Date(proposal.declined_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>

          {/* Reminder Info */}
          {canSendReminder && proposal.reminder_sent_count > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{proposal.reminder_sent_count} reminder{proposal.reminder_sent_count > 1 ? 's' : ''} sent</span>
              {proposal.last_reminder_date && (
                <span>• Last: {format(new Date(proposal.last_reminder_date), 'MMM d')}</span>
              )}
            </div>
          )}

          {/* Signature Info */}
          {proposal.signature_data && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">
                  Signed by {proposal.signature_data.signer_name}
                </span>
                <span className="text-green-700">({proposal.signature_data.signer_email})</span>
              </div>
            </div>
          )}

          {/* Decline Info */}
          {proposal.declined_reason && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2 text-sm">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <div>
                  <span className="font-medium text-red-900 block">Declined</span>
                  <span className="text-red-700">{proposal.declined_reason}</span>
                </div>
              </div>
            </div>
          )}

          {/* Expiration Warning */}
          {proposal.expiration_date && new Date(proposal.expiration_date) < new Date() && proposal.status !== 'signed' && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-900">
                  This proposal expired on {format(new Date(proposal.expiration_date), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          )}

          {/* Recipients */}
          {proposal.recipient_emails?.length > 0 && (
            <div className="mt-3">
              <span className="text-sm text-gray-600">Recipients: </span>
              {proposal.recipient_emails.map((email, idx) => (
                <Badge key={idx} variant="outline" className="ml-2">
                  <Mail className="w-3 h-3 mr-1" />
                  {email}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: proposal.content_html }}
            />
          </div>

          {/* Signature Section */}
          {showSignature && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-blue-600" />
                Electronic Signature
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={signerEmail}
                      onChange={(e) => setSignerEmail(e.target.value)}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sign Below *
                  </label>
                  <SignaturePad onSave={setSignaturePad} />
                  {signaturePad && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => signaturePad.clear()}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-600">
                  By signing above, you agree to the terms and conditions outlined in this proposal.
                  Your signature will be legally binding and timestamped.
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmitSignature}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Signature
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSignature(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Decline Section */}
          {showDecline && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6 border-2 border-red-500">
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

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {canSendReminder && (
                <Button 
                  variant="outline" 
                  onClick={handleSendReminder}
                  disabled={sendingReminder}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  {sendingReminder ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Send Reminder
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {proposal.status === "draft" && (
                <Button onClick={handleMarkSent} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  Mark as Sent
                </Button>
              )}
              {canSign && !showSignature && !showDecline && (
                <>
                  <Button onClick={handleInitiateSignature} className="bg-green-600 hover:bg-green-700">
                    <PenTool className="w-4 h-4 mr-2" />
                    Sign Proposal
                  </Button>
                  <Button onClick={() => setShowDecline(true)} className="bg-red-600 hover:bg-red-700">
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}