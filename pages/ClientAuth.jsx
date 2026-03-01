import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { getClientPortalUrl, getInternalPortalUrl } from "@/components/utils/subdomainHelpers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClientAuth() {
  const [checking, setChecking] = useState(true);
  const [isCurrentClient, setIsCurrentClient] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        
        if (isAuth) {
          const user = await base44.auth.me();
          
          // Notify admins of new user signup (if this is first login)
          const params = new URLSearchParams(window.location.search);
          if (params.get('message') === 'complete_registration') {
            try {
              const adminUsers = await base44.entities.User.filter({ role: 'admin' });
              for (const admin of adminUsers) {
                await base44.entities.Notification.create({
                  recipient_email: admin.email,
                  type: 'user_signup',
                  title: 'New User Registered',
                  message: `${user.full_name} (${user.email}) just completed their registration`,
                  link: `/UserManagement`,
                  priority: 'normal',
                  read: false,
                  metadata: { user_email: user.email, user_role: user.role }
                });
              }
            } catch (notifError) {
              console.error("Error creating notifications:", notifError);
            }
          }
          
          // Redirect based on role
          if (user.role === 'admin' || user.role === 'user') {
            window.location.href = getInternalPortalUrl(createPageUrl("InternalDashboard"));
          } else {
            window.location.href = getClientPortalUrl(createPageUrl("ClientPortal"));
          }
        } else {
          setChecking(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleClientSelection = (value) => {
    setIsCurrentClient(value);
    
    if (value === "no") {
      setShowMessage(true);
      setTimeout(() => {
        window.location.href = createPageUrl("Contact");
      }, 3000);
    } else if (value === "yes") {
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-6">
        <Card className="p-12 text-center max-w-md border-0 shadow-2xl">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Account Creation</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Please reach out directly if you would like to create an account.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to contact page...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-6">
      <Card className="p-12 text-center max-w-md border-0 shadow-2xl">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Client Portal Access</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Welcome! Are you a current client?
        </p>
        
        <div className="mb-6">
          <Select value={isCurrentClient} onValueChange={handleClientSelection}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Current Client?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes - I'm a current client</SelectItem>
              <SelectItem value="no">No - I need to create an account</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isCurrentClient === "yes" && (
          <div className="text-sm text-gray-500 animate-pulse">
            Redirecting to login...
          </div>
        )}
      </Card>
    </div>
  );
}