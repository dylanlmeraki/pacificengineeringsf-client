import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { getInternalPortalUrl, getClientPortalUrl } from "@/components/utils/subdomainHelpers";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const [checking, setChecking] = useState(true);

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
          base44.auth.redirectToLogin(window.location.href);
        }
      } catch (error) {
        console.error("Auth error:", error);
        base44.auth.redirectToLogin(window.location.href);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return null;
}