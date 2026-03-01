import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getClientPortalUrl, getMainDomainUrl } from "@/components/utils/subdomainHelpers";
import { getMe, logout as authLogout } from "@/components/services/authClient";
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  Search,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import ProfileModal from "./ProfileModal";
import ErrorBoundary from "@/components/ErrorBoundary";

import { logError } from "@/components/utils/errorHandler";
import { warn } from "@/components/utils/logger";

export default function InternalLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authError, setAuthError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getMe();
        setUser(currentUser);
        setAuthError(null);
      } catch (error) {
        logError(error, { context: 'InternalLayout - fetchUser' });
        warn('Failed to fetch user in InternalLayout', { error: error?.message });
        setAuthError(error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    authLogout();
  };

  const navItems = [
    {
      name: "Dashboard",
      path: createPageUrl("InternalDashboard"),
      icon: LayoutDashboard
    },
    {
      name: "Project Manager",
      path: createPageUrl("ProjectManager"),
      icon: FileText
    },
    {
      name: "Contacts",
      path: createPageUrl("ContactManager"),
      icon: Users
    },
    {
      name: "CRM",
      path: createPageUrl("SalesDashboard"),
      icon: Target
    },
    {
      name: "Content Manager",
      path: createPageUrl("ContentManager"),
      icon: FileText
    },
    {
      name: "SalesBot Outreach",
      path: createPageUrl("SalesBotControl"),
      icon: Sparkles
    },
    {
      name: "Client Communications",
      path: createPageUrl("ClientCommunications"),
      icon: Mail
    },
    {
      name: "Page Builder",
      path: createPageUrl("PageBuilder"),
      icon: LayoutDashboard
    },
    {
      name: "Finances / Analytics",
      path: createPageUrl("AnalyticsDashboard"),
      icon: LayoutDashboard
    },
    {
      name: "Workflows",
      path: createPageUrl("WorkflowBuilder"),
      icon: Settings
    },
    {
      name: "Admin Console",
      path: createPageUrl("AdminConsole"),
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Spacing guards: consistent content max-width and horizontal padding at all breakpoints applied in main wrapper */}
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/fbd78afc1_Asset2-100.jpg"
              alt="Pacific Engineering"
              className="h-8 w-8 object-contain"
            />
            <div>
              <div className="font-bold text-gray-900">Internal Portal</div>
              <div className="text-xs text-gray-500">Pacific Engineering</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {user && <NotificationCenter user={user} />}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white z-40 transform transition-all duration-300 shadow-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "lg:w-20 w-20" : "lg:w-64 w-64"}`}
      >
        <div className="p-6 border-b border-gray-700">
          <div className={`flex items-center gap-3 mb-4 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/fbd78afc1_Asset2-100.jpg"
              alt="Pacific Engineering"
              className="h-10 w-10 object-contain"
            />
            {!sidebarCollapsed && (
              <div>
                <div className="font-semibold text-lg">Pacific Engineering</div>
                <div className="text-xs text-gray-400">Internal Portal</div>
              </div>
            )}
          </div>
          {user && !sidebarCollapsed && (
            <button
              onClick={() => setShowProfileModal(true)}
              className="bg-gray-700 px-2 py-1 rounded-[14px] w-full hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{user.full_name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full whitespace-nowrap">
                  {user.role}
                </span>
              </div>
            </button>
          )}
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.external && location.pathname === item.path;
            
            if (item.external) {
              return (
                <a
                  key={item.name}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-300 hover:bg-gray-700 hover:text-white ${sidebarCollapsed ? "justify-center" : ""}`}
                  title={sidebarCollapsed ? item.name : ""}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                </a>
              );
            }
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                } ${sidebarCollapsed ? "justify-center" : ""}`}
                title={sidebarCollapsed ? item.name : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            variant="outline"
            className="w-full mb-2 border-gray-400 text-white bg-0 hover:bg-gray-300 hover:text-black-400 hover:border-white hidden lg:flex items-center justify-center"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4 mr-2" />}
            {!sidebarCollapsed && "Collapse"}
          </Button>
          <a href={getMainDomainUrl(createPageUrl("Home"))} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="w-full mb-2 border-gray-400 text-white bg-gradient-to-br from-green-600 to-emerald-600 hover:bg-emerald-800 hover:text-white hover:border-white flex items-center justify-center"
              title="Public Site"
            >
              <Building2 className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-2">Public Site</span>}
            </Button>
          </a>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-gray-400 text-white bg-gradient-to-br from-red-500 to-red-600 hover:bg-red-800 hover:text-white hover:border-white flex items-center justify-center"
            title="Logout"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`min-h-screen pt-16 lg:pt-0 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        {/* Uniform content width and padding guards across internal SPA */}
        <ErrorBoundary>
          <div className="w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 lg:px-8 xl:px-10 2xl:px-12">

            {children}
          </div>
        </ErrorBoundary>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  );
}