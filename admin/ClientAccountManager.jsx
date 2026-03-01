import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  UserPlus,
  Mail,
  Shield,
  Edit,
  Trash2,
  Loader2,
  Search,
  Activity,
  Clock,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import TwoFactorSetup from "../auth/TwoFactorSetup";

export default function ClientAccountManager({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(null);
  const queryClient = useQueryClient();

  const [newClient, setNewClient] = useState({
    full_name: "",
    email: "",
    company: "",
    role: "member",
    enable_2fa: false
  });
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const { data: clientAccounts = [] } = useQuery({
    queryKey: ['client-accounts'],
    queryFn: async () => {
      return await base44.entities.User.filter({ account_type: "client" });
    },
    initialData: []
  });

  const { data: clientActivity = [] } = useQuery({
    queryKey: ['client-activity', showActivityLog?.id],
    queryFn: async () => {
      if (!showActivityLog) return [];
      return await base44.entities.AuditLog.filter({ 
        actor_email: showActivityLog.email 
      }, '-created_date', 50);
    },
    enabled: !!showActivityLog,
    initialData: []
  });

  const sendClientInvite = async (clientData) => {
    setIsSendingInvite(true);
    try {
      await base44.functions.invoke('sendClientInvite', {
        email: clientData.email,
        companyName: clientData.company,
        invitedByName: currentUser?.full_name
      });

      queryClient.invalidateQueries({ queryKey: ['client-invites-all'] });
      setShowCreateDialog(false);
      setNewClient({
        full_name: "",
        email: "",
        company: "",
        role: "member",
        enable_2fa: false
      });
      alert(`Invitation sent to ${clientData.email}`);
    } catch (error) {
      alert('Failed to send invitation: ' + error.message);
    }
    setIsSendingInvite(false);
  };

  const updateClientMutation = useMutation({
    mutationFn: async ({ clientId, updates }) => {
      await base44.entities.User.update(clientId, updates);
      
      await base44.entities.AuditLog.create({
        actor_email: currentUser?.email,
        actor_name: currentUser?.full_name,
        action: "user_updated",
        resource_type: "ClientAccount",
        resource_id: clientId,
        details: `Updated client account settings`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-accounts'] });
      setEditingClient(null);
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId) => {
      const client = clientAccounts.find(c => c.id === clientId);
      
      await base44.entities.User.delete(clientId);
      
      await base44.entities.AuditLog.create({
        actor_email: currentUser?.email,
        actor_name: currentUser?.full_name,
        action: "user_deleted",
        resource_type: "ClientAccount",
        resource_id: clientId,
        resource_name: client?.full_name,
        details: `Removed client account access`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-accounts'] });
    }
  });

  const filteredClients = clientAccounts.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.full_name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.client_company?.toLowerCase().includes(query)
    );
  });

  const roleColors = {
    owner: "bg-purple-100 text-purple-700 border-purple-300",
    admin: "bg-blue-100 text-blue-700 border-blue-300",
    member: "bg-green-100 text-green-700 border-green-300",
    viewer: "bg-gray-100 text-gray-700 border-gray-300"
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-lg">
          <div className="text-2xl font-bold text-gray-900">{clientAccounts.length}</div>
          <div className="text-sm text-gray-600">Total Clients</div>
        </Card>
        <Card className="p-4 border-0 shadow-lg">
          <div className="text-2xl font-bold text-purple-600">
            {clientAccounts.filter(c => c.client_portal_role === "owner").length}
          </div>
          <div className="text-sm text-gray-600">Account Owners</div>
        </Card>
        <Card className="p-4 border-0 shadow-lg">
          <div className="text-2xl font-bold text-blue-600">
            {clientAccounts.filter(c => c.client_portal_role === "admin").length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </Card>
        <Card className="p-4 border-0 shadow-lg">
          <div className="text-2xl font-bold text-green-600">
            {clientAccounts.filter(c => c.twofa_enabled).length}
          </div>
          <div className="text-sm text-gray-600">Using 2FA</div>
        </Card>
      </div>

      {/* Search & Create */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search clients by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Client
            </Button>
          </div>
        </div>
      </Card>

      {/* Client Accounts Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Portal Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Security
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No client accounts found
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{client.full_name}</div>
                          <div className="text-sm text-gray-600">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {client.client_company || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${roleColors[client.client_portal_role || "member"]} border`}>
                        {client.client_portal_role || "member"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {client.twofa_enabled ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Shield className="w-4 h-4" />
                          <span className="text-xs">2FA Enabled</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No 2FA</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.created_date ? format(new Date(client.created_date), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingClient(client)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowActivityLog(client)}
                          className="text-blue-600"
                        >
                          <Activity className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Remove access for ${client.full_name}?`)) {
                              deleteClientMutation.mutate(client.id);
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Client Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Client Account</DialogTitle>
            <DialogDescription>
              Set up a new client portal account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={newClient.full_name}
                onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                placeholder="Acme Construction"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Portal Role</label>
              <Select
                value={newClient.role}
                onValueChange={(value) => setNewClient({ ...newClient, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner - Full Control</SelectItem>
                  <SelectItem value="admin">Admin - Manage Projects & Team</SelectItem>
                  <SelectItem value="member">Member - View & Comment</SelectItem>
                  <SelectItem value="viewer">Viewer - Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => sendClientInvite(newClient)}
                disabled={isSendingInvite || !newClient.email || !newClient.company}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Client Account</DialogTitle>
            <DialogDescription>
              Update {editingClient?.full_name}'s account settings
            </DialogDescription>
          </DialogHeader>

          {editingClient && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Portal Role</label>
                <Select
                  value={editingClient.client_portal_role || "member"}
                  onValueChange={(value) => setEditingClient({ ...editingClient, client_portal_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingClient(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => updateClientMutation.mutate({
                    clientId: editingClient.id,
                    updates: { client_portal_role: editingClient.client_portal_role }
                  })}
                  disabled={updateClientMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateClientMutation.isPending ? (
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
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Log Dialog */}
      <Dialog open={!!showActivityLog} onOpenChange={() => setShowActivityLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Log - {showActivityLog?.full_name}</DialogTitle>
            <DialogDescription>
              Recent activity for this client account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {clientActivity.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No activity recorded</p>
            ) : (
              clientActivity.map((log) => (
                <div key={log.id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <Badge variant="outline" className="text-xs">
                          {log.action?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        {log.resource_type}: <strong>{log.resource_name}</strong>
                      </p>
                      {log.details && (
                        <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(log.created_date), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}