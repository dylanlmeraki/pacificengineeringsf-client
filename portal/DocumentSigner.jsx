import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SignaturePad from "../proposals/SignaturePad";
import { FileCheck, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function DocumentSigner({ 
  documentId, 
  documentType, // 'proposal' or 'contract'
  projectId,
  onSignComplete,
  signerName: initialSignerName,
  signerEmail
}) {
  const [step, setStep] = useState("review"); // review, sign, complete
  const [signerName, setSignerName] = useState(initialSignerName || "");
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  const handleSignatureCapture = (signature) => {
    setSignatureData(signature);
    setShowSignaturePad(false);
  };

  const handleSign = async () => {
    if (!signerName.trim()) {
      alert("Please enter your full name");
      return;
    }

    if (!agreementChecked) {
      alert("Please accept the terms and conditions");
      return;
    }

    if (!signatureData) {
      alert("Please provide your signature");
      return;
    }

    setSigning(true);

    try {
      const signedAt = new Date().toISOString();
      const ipAddress = "client"; // In production, capture real IP

      const signature = {
        signer_name: signerName,
        signer_email: signerEmail,
        signature_image: signatureData,
        ip_address: ipAddress,
        signed_at: signedAt
      };

      // Update document based on type
      if (documentType === 'proposal') {
        await base44.entities.Proposal.update(documentId, {
          status: 'signed',
          signed_date: signedAt,
          signature_data: signature
        });
      } else if (documentType === 'contract') {
        // For contracts, store in ProjectDocument or dedicated Contract entity
        await base44.entities.ProjectDocument.update(documentId, {
          status: 'Approved',
          signature_data: signature
        });
      }

      // Create notifications for admins
      const admins = await base44.entities.User.filter({ role: 'admin' });
      
      for (const admin of admins) {
        await base44.functions.invoke('sendNotification', {
          recipient_email: admin.email,
          type: documentType === 'proposal' ? 'proposal_sent' : 'project_update',
          title: `Document Signed: ${documentType === 'proposal' ? 'Proposal' : 'Contract'}`,
          message: `${signerName} has signed the ${documentType}. Document ID: ${documentId}`,
          priority: 'high',
          link: documentType === 'proposal' 
            ? `/ProposalDashboard?id=${documentId}`
            : `/ProjectDetail?id=${projectId}`
        });
      }

      // Send confirmation to client
      await base44.integrations.Core.SendEmail({
        to: signerEmail,
        subject: `Document Signature Confirmation - Pacific Engineering`,
        body: `Dear ${signerName},\n\nThank you for signing the ${documentType}. This email confirms your electronic signature has been securely recorded.\n\nSigned on: ${format(new Date(signedAt), 'PPP p')}\n\nA copy of the signed document is available in your client portal.\n\nBest regards,\nPacific Engineering Team`
      });

      setStep("complete");
      
      if (onSignComplete) {
        onSignComplete(signature);
      }
    } catch (error) {
      console.error("Signature error:", error);
      alert("Failed to complete signature. Please try again.");
    }

    setSigning(false);
  };

  if (step === "complete") {
    return (
      <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Document Signed Successfully!</h3>
          <p className="text-gray-700 mb-6">
            Your signature has been securely recorded and all parties have been notified.
          </p>
          <div className="bg-white rounded-lg p-4 mb-6 border-2 border-green-200">
            <div className="text-sm text-gray-600 mb-2">Signed by:</div>
            <div className="font-bold text-gray-900">{signerName}</div>
            <div className="text-sm text-gray-600">{signerEmail}</div>
            <div className="text-xs text-gray-500 mt-2">
              {format(new Date(), 'PPP p')}
            </div>
          </div>
          <Badge className="bg-green-600 text-white">
            <Shield className="w-3 h-3 mr-1" />
            Legally Binding Signature
          </Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 border-0 shadow-xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Electronic Signature</h3>
            <p className="text-gray-600">Sign this document securely</p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              Your electronic signature is legally binding and will be securely encrypted. 
              All parties will be notified upon completion.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Legal Name *
          </label>
          <Input
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Enter your full legal name"
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            value={signerEmail}
            disabled
            className="h-12 bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Your Signature *
          </label>
          
          {!signatureData ? (
            !showSignaturePad ? (
              <Button
                onClick={() => setShowSignaturePad(true)}
                variant="outline"
                className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="text-center">
                  <FileCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-600">Click to Sign</span>
                </div>
              </Button>
            ) : (
              <SignaturePad
                onSave={handleSignatureCapture}
                onCancel={() => setShowSignaturePad(false)}
              />
            )
          ) : (
            <div className="relative border-2 border-green-500 rounded-lg p-4 bg-green-50">
              <img src={signatureData} alt="Your Signature" className="max-h-32 mx-auto" />
              <Button
                onClick={() => {
                  setSignatureData(null);
                  setShowSignaturePad(true);
                }}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
              >
                Change
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 rounded"
            />
            <div className="text-sm text-gray-700">
              I certify that I am authorized to sign this document and agree to use electronic 
              signatures. I understand that my electronic signature is the legal equivalent of 
              my manual signature and is legally binding.
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSign}
            disabled={!signerName.trim() || !agreementChecked || !signatureData || signing}
            className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            {signing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5 mr-2" />
                Sign Document
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          By signing, you agree to the terms and conditions outlined in this document.
          Your signature will be timestamped and stored securely.
        </div>
      </div>
    </Card>
  );
}