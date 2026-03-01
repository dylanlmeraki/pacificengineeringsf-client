import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export const PERMISSION_CATEGORIES = {
  analytics: {
    name: "Analytics & Reports",
    permissions: [
      { key: "view_analytics", label: "View Analytics Dashboard" },
      { key: "export_reports", label: "Export Reports" },
      { key: "view_client_analytics", label: "View Client Analytics" }
    ]
  },
  users: {
    name: "User Management",
    permissions: [
      { key: "invite_users", label: "Invite New Users" },
      { key: "edit_user_roles", label: "Edit User Roles & Permissions" },
      { key: "revoke_access", label: "Revoke User Access" },
      { key: "view_user_activity", label: "View User Activity Logs" }
    ]
  },
  clients: {
    name: "Client Management",
    permissions: [
      { key: "manage_clients", label: "Create & Edit Clients" },
      { key: "invite_clients", label: "Invite Client Portal Users" },
      { key: "view_client_data", label: "View All Client Data" },
      { key: "manage_client_projects", label: "Manage Client Projects" }
    ]
  },
  projects: {
    name: "Project Management",
    permissions: [
      { key: "create_projects", label: "Create New Projects" },
      { key: "edit_projects", label: "Edit Projects" },
      { key: "delete_projects", label: "Delete Projects" },
      { key: "manage_milestones", label: "Manage Milestones & Change Orders" }
    ]
  },
  proposals: {
    name: "Proposals & Contracts",
    permissions: [
      { key: "create_proposals", label: "Create Proposals" },
      { key: "edit_proposals", label: "Edit Proposals" },
      { key: "send_proposals", label: "Send Proposals to Clients" },
      { key: "manage_templates", label: "Manage Proposal Templates" }
    ]
  },
  crm: {
    name: "CRM & Sales",
    permissions: [
      { key: "view_crm", label: "View CRM Dashboard" },
      { key: "manage_prospects", label: "Manage Prospects & Leads" },
      { key: "use_salesbot", label: "Use AI Sales Bot" },
      { key: "manage_outreach", label: "Manage Sales Outreach" }
    ]
  },
  content: {
    name: "Content Management",
    permissions: [
      { key: "edit_blog", label: "Create & Edit Blog Posts" },
      { key: "publish_blog", label: "Publish Blog Posts" },
      { key: "manage_seo", label: "Manage SEO Settings" },
      { key: "edit_pages", label: "Edit Website Pages" }
    ]
  },
  settings: {
    name: "System Settings",
    permissions: [
      { key: "edit_settings", label: "Edit System Settings" },
      { key: "manage_integrations", label: "Manage Integrations" },
      { key: "view_audit_logs", label: "View Full Audit Logs" },
      { key: "manage_workflows", label: "Manage Workflow Automation" }
    ]
  }
};

export default function PermissionsEditor({ user, permissions = [], onChange }) {
  const [localPermissions, setLocalPermissions] = useState(permissions);

  const hasPermission = (key) => localPermissions.includes(key);

  const togglePermission = (key) => {
    let updated;
    if (hasPermission(key)) {
      updated = localPermissions.filter(p => p !== key);
    } else {
      updated = [...localPermissions, key];
    }
    setLocalPermissions(updated);
    onChange(updated);
  };

  const enableAll = () => {
    const all = Object.values(PERMISSION_CATEGORIES).flatMap(cat => 
      cat.permissions.map(p => p.key)
    );
    setLocalPermissions(all);
    onChange(all);
  };

  const disableAll = () => {
    setLocalPermissions([]);
    onChange([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Granular Permissions</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={enableAll}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Enable All
          </Button>
          <Button size="sm" variant="outline" onClick={disableAll}>
            <XCircle className="w-4 h-4 mr-1" />
            Disable All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
          <Card key={categoryKey} className="p-4 border-0 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">{category.name}</h4>
            <div className="space-y-2">
              {category.permissions.map((permission) => (
                <div
                  key={permission.key}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={permission.key}
                      checked={hasPermission(permission.key)}
                      onCheckedChange={() => togglePermission(permission.key)}
                    />
                    <label
                      htmlFor={permission.key}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {permission.label}
                    </label>
                  </div>
                  {hasPermission(permission.key) && (
                    <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}