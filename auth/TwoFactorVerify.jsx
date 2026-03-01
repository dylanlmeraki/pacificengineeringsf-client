import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Loader2, ArrowLeft } from "lucide-react";

export default function TwoFactorVerify({ user, onVerify, onCancel }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // In production, this would verify against the backend
      // For now, simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the onVerify callback with the code
      onVerify(code);
    } catch (err) {
      setError("Invalid code. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 border-0 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-600">
            Enter the {useBackupCode ? "backup code" : user?.twofa_method === "sms" ? "code from your SMS" : "code from your authenticator app"}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
              maxLength={useBackupCode ? 8 : 6}
              className="text-center text-xl tracking-wider h-14"
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            />
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || !code}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </Button>

          <div className="space-y-3">
            <button
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="text-sm text-blue-600 hover:text-blue-700 w-full text-center"
            >
              {useBackupCode ? "Use authenticator code" : "Use backup code instead"}
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}