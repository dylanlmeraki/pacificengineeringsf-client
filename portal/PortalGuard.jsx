import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getInternalPortalUrl, getClientPortalUrl } from "@/components/utils/subdomainHelpers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, RefreshCw, Shield } from "lucide-react";

export default function PortalGuard({ children, allowedRoles = ["user"], portalType = "client" }) {
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    user: null,
    error: null,
    retryCount: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      
      if (!isAuth) {
        setAuthState(prev => ({ ...prev, loading: false, authenticated: false }));
        return;
      }

      const user = await base44.auth.me();
      
      // Validate user role for portal type
      if (portalType === "internal" && user.role === "user") {
        setAuthState({
          loading: false,
          authenticated: false,
          user: null,
          error: "access_denied"
        });
        return;
      }

      if (portalType === "client" && user.role !== "user") {
        setAuthState({
          loading: false,
          authenticated: false,
          user: null,
          error: "wrong_portal"
        });
        return;
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(user.role)) {
        setAuthState({
          loading: false,
          authenticated: false,
          user,
          error: "insufficient_permissions"
        });
        return;
      }

      setAuthState({
        loading: false,
        authenticated: true,
        user,
        error: null,
        retryCount: 0
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      
      // Handle specific error types
      if (error.message?.includes("expired") || error.message?.includes("invalid")) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          authenticated: false,
          error: "session_expired"
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: "auth_error",
          retryCount: prev.retryCount + 1
        }));
      }
    }
  };

  const handleRetry = () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    setTimeout(checkAuth, 500);
  };

  const handleReauth = () => {
    const currentPath = window.location.pathname + window.location.search;
    base44.auth.redirectToLogin(currentPath);
  };

  // Loading state
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (!authState.authenticated) {
    if (authState.error === "session_expired") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-6">
          <Card className="p-12 text-center max-w-md border-0 shadow-2xl">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Session Expired</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your session has expired for security reasons. Please log in again to continue.
            </p>
            <Button 
              onClick={handleReauth}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Log In Again
            </Button>
          </Card>
        </div>
      );
    }

    if (authState.error === "access_denied") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
          <Card className="p-12 text-center max-w-md border-0 shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You don't have permission to access the internal portal. This area is restricted to team members only.
            </p>
            <div className="flex gap-3">
              <a href={getClientPortalUrl(createPageUrl("ClientPortal"))} className="flex-1">
                <Button 
                  variant="outline"
                  className="w-full"
                >
                  Client Portal
                </Button>
              </a>
              <Button 
                onClick={() => base44.auth.logout("/")}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
              >
                Logout
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    if (authState.error === "wrong_portal") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-6">
          <Card className="p-12 text-center max-w-md border-0 shadow-2xl">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Wrong Portal</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You're logged in as a team member. Please use the Internal Dashboard instead.
            </p>
            <a href={getInternalPortalUrl(createPageUrl("InternalDashboard"))}>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Internal Dashboard
              </Button>
            </a>
          </Card>
        </div>
      );
    }

    if (authState.error === "auth_error" && authState.retryCount < 3) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-6">
          <Card className="p-12 text-center max-w-md border-0 shadow-2xl">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Connection Issue</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're having trouble verifying your authentication. This might be a temporary network issue.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={handleRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry ({authState.retryCount}/3)
              </Button>
              <Button 
                onClick={handleReauth}
                variant="outline"
                className="flex-1"
              >
                Re-authenticate
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // Not authenticated - redirect to auth
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-6">
        <Card className="p-12 text-center max-w-md border-0 shadow-2xl">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Required</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Please log in to access {portalType === "internal" ? "the internal portal" : "your client portal"}.
          </p>
          <Button 
            onClick={handleReauth}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  // Authenticated - render children with user context
  return React.cloneElement(children, { user: authState.user });
}