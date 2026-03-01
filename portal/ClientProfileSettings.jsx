import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Building2, Phone, MapPin, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import TwoFactorSetup from "../auth/TwoFactorSetup";

export default function ClientProfileSettings({ user, onUpdate }) {
  const [profile, setProfile] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    company_name: user?.company_name || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || "",
        email: user.email || "",
        company_name: user.company_name || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await base44.auth.updateMe({
        full_name: profile.full_name,
        company_name: profile.company_name,
        phone: profile.phone,
        address: profile.address
      });

      toast.success("Profile updated successfully");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Settings</h3>
          <p className="text-gray-600">Update your personal information</p>
        </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name
          </label>
          <Input
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </label>
          <Input
            value={profile.email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company Name
          </label>
          <Input
            value={profile.company_name}
            onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
            placeholder="ABC Construction"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </label>
          <Input
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </label>
          <Input
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            placeholder="123 Main St, City, State 12345"
          />
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>

    {/* Two-Factor Authentication */}
    <TwoFactorSetup user={user} onUpdate={onUpdate} />
  </div>
  );
}