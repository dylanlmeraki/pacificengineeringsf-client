import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, X, Loader2, CheckCircle } from "lucide-react";
import TwoFactorSetup from "../auth/TwoFactorSetup";

export default function ProfileModal({ user: initialUser, onClose, onUpdate }) {
  const [user, setUser] = useState(initialUser);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: initialUser?.full_name || "",
    email: initialUser?.email || "",
    department: initialUser?.department || "",
    job_title: initialUser?.job_title || ""
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        full_name: profile.full_name,
        department: profile.department,
        job_title: profile.job_title
      });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      if (onUpdate) onUpdate(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
              <p className="text-sm text-gray-600">Manage your account settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <Input
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      placeholder="Engineering, Sales, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Job Title</label>
                    <Input
                      value={profile.job_title}
                      onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                      placeholder="Project Manager, Engineer, etc."
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
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
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <TwoFactorSetup user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}