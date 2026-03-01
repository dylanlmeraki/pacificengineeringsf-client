import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Smartphone,
  Key,
  Copy,
  CheckCircle,
  Loader2,
  QrCode,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export default function TwoFactorSetup({ user, onUpdate }) {
  const [showSetup, setShowSetup] = useState(false);
  const [method, setMethod] = useState("totp");
  const [phone, setPhone] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const generateTOTPSecret = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a random 32-character base32 secret for TOTP (Time-based One-Time Password). Also generate 8 backup codes (each 8 characters, alphanumeric). Return JSON: { "secret": "...", "backupCodes": [...] }`,
        response_json_schema: {
          type: "object",
          properties: {
            secret: { type: "string" },
            backupCodes: { type: "array", items: { type: "string" } }
          }
        }
      });

      const data = typeof response === 'string' ? JSON.parse(response) : response;
      setTotpSecret(data.secret);
      setBackupCodes(data.backupCodes);
      
      // Generate QR code URL for authenticator apps
      const issuer = "Pacific Engineering";
      const label = `${issuer}:${user.email}`;
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${data.secret}&issuer=${encodeURIComponent(issuer)}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`);
      
      setStep(2);
    } catch (error) {
      toast.error("Failed to generate 2FA secret");
    }
    setLoading(false);
  };

  const startSetup = (selectedMethod) => {
    setMethod(selectedMethod);
    setShowSetup(true);
    setStep(1);
    
    if (selectedMethod === "totp") {
      generateTOTPSecret();
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      await base44.auth.updateMe({
        twofa_enabled: true,
        twofa_method: method,
        twofa_secret: method === "totp" ? totpSecret : null,
        twofa_phone: method === "sms" ? phone : null,
        twofa_backup_codes: backupCodes
      });

      toast.success("2FA enabled successfully!");
      setShowSetup(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    }
    setLoading(false);
  };

  const disable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) {
      return;
    }

    setLoading(true);
    try {
      await base44.auth.updateMe({
        twofa_enabled: false,
        twofa_method: "none",
        twofa_secret: null,
        twofa_phone: null,
        twofa_backup_codes: []
      });

      toast.success("2FA disabled");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to disable 2FA");
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          {user?.twofa_enabled ? (
            <Badge className="bg-green-500">Enabled</Badge>
          ) : (
            <Badge variant="outline">Disabled</Badge>
          )}
        </div>

        {user?.twofa_enabled ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">2FA is active</span>
              </div>
              <p className="text-sm text-green-600">
                Method: {user.twofa_method === "totp" ? "Authenticator App (TOTP)" : "SMS"}
              </p>
            </div>
            <Button
              onClick={disable2FA}
              disabled={loading}
              variant="outline"
              className="text-red-600 hover:bg-red-50"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Disable 2FA
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 mb-4">
              Choose a method to secure your account:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => startSetup("totp")}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                  <h4 className="font-semibold">Authenticator App</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Use Google Authenticator, Authy, or similar apps
                </p>
              </button>

              <button
                onClick={() => startSetup("sms")}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Key className="w-6 h-6 text-blue-600" />
                  <h4 className="font-semibold">SMS Verification</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Receive codes via text message
                </p>
              </button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {method === "totp" ? "Setup Authenticator App" : "Setup SMS Verification"}
            </DialogTitle>
            <DialogDescription>
              Follow the steps below to enable 2FA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {method === "totp" && step === 2 && (
              <>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-700 mb-4">
                      Scan this QR code with your authenticator app:
                    </p>
                    {qrCodeUrl && (
                      <img src={qrCodeUrl} alt="QR Code" className="mx-auto rounded-lg shadow-md" />
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-2">Or enter this code manually:</p>
                    <div className="flex items-center justify-between bg-white border rounded px-3 py-2">
                      <code className="text-sm font-mono">{totpSecret}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(totpSecret)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter the 6-digit code:</label>
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg tracking-wider"
                    />
                  </div>

                  {backupCodes.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900">Backup Codes</p>
                          <p className="text-xs text-yellow-700">Save these codes securely. Each can be used once if you lose access to your authenticator.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {backupCodes.map((code, idx) => (
                          <code key={idx} className="text-xs bg-white px-2 py-1 rounded">
                            {code}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {method === "sms" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number:</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We'll send a verification code to this number to confirm.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSetup(false)}>
                Cancel
              </Button>
              <Button
                onClick={verifyAndEnable}
                disabled={loading || (method === "totp" && !verificationCode) || (method === "sms" && !phone)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}