import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getInternalPortalUrl } from "@/components/utils/subdomainHelpers";
import { Card } from "@/components/ui/card";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminRoute({ children, requiredRole = "admin" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (requiredRole === "admin" && currentUser.role === "admin") {
          setAuthorized(true);
        } else if (requiredRole === "user" && currentUser) {
          setAuthorized(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthorized(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="p-12 text-center max-w-md border-0 shadow-2xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            You don't have permission to access this area. This section is restricted to administrators only.
          </p>
          <a href={getInternalPortalUrl(createPageUrl("InternalDashboard"))}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  return children;
}