import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Settings, Loader2, CheckCircle } from "lucide-react";
import TwoFactorSetup from "../components/auth/TwoFactorSetup";
import InternalLayout from "../components/internal/InternalLayout";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    department: "",
    job_title: ""
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setProfile({
        full_name: currentUser.full_name || "",
        email: currentUser.email || "",
        department: currentUser.department || "",
        job_title: currentUser.job_title || ""
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        full_name: profile.full_name,
        department: profile.department,
        job_title: profile.job_title
      });
      await fetchUser();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <InternalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <User className="w-10 h-10 text-blue-600" />
            My Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account settings and security preferences
          </p>
        </div>

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
            <TwoFactorSetup user={user} onUpdate={fetchUser} />
          </TabsContent>
        </Tabs>
      </div>
    </InternalLayout>
  );
}