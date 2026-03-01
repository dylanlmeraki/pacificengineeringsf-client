import React, { useEffect, useState } from "react";
import { getPortalType, isInternalPortal, isClientPortal, isMainDomain } from "@/components/utils/subdomainHelpers";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function SubdomainRouter({ children }) {
  const [portalType, setPortalType] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const type = getPortalType();
      setPortalType(type);
      
      // Check authentication for portal access
      if (type === 'internal' || type === 'client') {
        try {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          
          // Validate user has correct role for portal
          if (type === 'internal' && currentUser.role !== 'admin' && currentUser.role !== 'user') {
            // Internal portal requires admin or user role
            window.location.href = '/';
          } else if (type === 'client' && (currentUser.role === 'admin' || currentUser.role === 'user')) {
            // Client portal should not be accessible to internal users
            // They should use the internal portal
            window.location.href = window.location.origin.replace('clientportal.', 'internalportal.');
          }
        } catch (error) {
          // Not authenticated, redirect to auth
          if (type === 'internal') {
            window.location.href = '/Auth';
          } else if (type === 'client') {
            window.location.href = '/ClientAuth';
          }
        }
      }
      
      setLoading(false);
    };
    
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  return children;
}