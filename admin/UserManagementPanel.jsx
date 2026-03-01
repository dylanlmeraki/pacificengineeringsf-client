import React, { useState, useEffect } from "react";
import { config } from "@/components/utils/envConfig";
import * as authClient from "@/components/services/authClient";
import * as apiClient from "@/components/services/apiClient";
import * as integrationsClient from "@/components/services/integrationsClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Shield,
  Mail,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Activity,
  UserX,
  Copy,
  Building2,
  Clock,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import PermissionsEditor from "./PermissionsEditor";
import ClientAccountManager from "./ClientAccountManager";

export default function UserManagementPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [revokeUser, setRevokeUser] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [editPermissions, setEditPermissions] = useState([]);
  const [showInviteClientDialog, setShowInviteClientDialog] = useState(false);
  const [clientInviteEmail, setClientInviteEmail] = useState("");
  const [clientCompanyName, setClientCompanyName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await authClient.getMe();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      return await apiClient.list('User', '-created_date', 100);
    },
    initialData: []
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      return await apiClient.list('AuditLog', '-created_date', 200);
    },
    initialData: []
  });

  const { data: clientInvites = [] } = useQuery({
    queryKey: ['client-invites-all'],
    queryFn: async () => {
      return await apiClient.list('ClientInvite', '-created_date', 100);
    },
    initialData: []
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }) => {
      return await apiClient.update('User', userId, updates);
    },
    onSuccess: async (updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      await apiClient.create('AuditLog', {
        actor_email: currentUser?.email,
        actor_name: currentUser?.full_name,
        action: variables.updates.role ? "role_changed" : "user_updated",
        resource_type: "User",
        resource_id: variables.userId,
        resource_name: updatedUser.full_name,
        details: variables.updates.role ? `Changed role to ${variables.updates.role}` : "User updated"
      });
      await apiClient.create('SystemLog', {
        type: 'user_permissions_sync',
        user_id: variables.userId,
        user_email: updatedUser.email,
        role: updatedUser.role,
        permissions: updatedUser.permissions || [],
        status: 'pending',
        created_at: new Date().toISOString()
      });
      setShowEditDialog(false);
      setEditingUser(null);
    }
  });

  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, name, role }) => {
      const inviteLink = `${config.internalPortalUrl}/auth?invite=true&email=${encodeURIComponent(email)}`;
      await integrationsClient.sendEmail({
        to: email,
        from_name: "Pacific Engineering",
        subject: "You've been invited to Pacific Engineering Portal",
        body: `
          <h2>Welcome to Pacific Engineering</h2>
          <p>Hi ${name},</p>
          <p>You've been invited to join the Pacific Engineering internal portal.</p>
          <p><strong>Your Role:</strong> ${role}</p>
          <p><a href="${inviteLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a></p>
          <p>This link will allow you to create your account and access the portal.</p>
        `
      });
      return { email, name, role };
    },
    onSuccess: async (data) => {
      await apiClient.create('AuditLog', {
        actor_email: currentUser?.email,
        actor_name: currentUser?.full_name,
        action: "user_created",
        resource_type: "User",
        resource_name: data.name,
        details: `Invited ${data.email} with role ${data.role}`
      });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("user");
    }
  });

  const inviteClientMutation = useMutation({
    mutationFn: async ({ email, companyName }) => {
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      const invite = await apiClient.create('ClientInvite', {
        invite_token: token,
        email: email.toLowerCase(),
        company_name: companyName,
        invited_by_email: currentUser?.email,
        invited_by_name: currentUser?.full_name,
        expires_at: expiresAt,
        used: false
      });
      const inviteUrl = `${config.clientPortalUrl}/portal-register?token=${token}`;
      await integrationsClient.sendEmail({
        to: email,
        from_name: "Pacific Engineering",
        subject: "You're invited to Pacific Engineering Client Portal",
        body: `
          <h2>Welcome to Pacific Engineering Client Portal</h2>
          <p>Hello,</p>
          <p>You've been invited to join the Pacific Engineering Client Portal.</p>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><a href="${inviteUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Create Your Account</a></p>
          <p>This invitation expires in 72 hours.</p>
          <p>Best regards,<br>Pacific Engineering Team</p>
        `
      });
      return invite;
    },
    onSuccess: async (invite) => {
      await apiClient.create('AuditLog', {
        actor_email: currentUser?.email,
        actor_name: currentUser?.full_name,
        action: "user_created",
        resource_type: "ClientInvite",
        resource_name: invite.email,
        details: `Sent client portal invitation to ${invite.email} for ${invite.company_name}`
      });
      queryClient.invalidateQueries({ queryKey: ['client-invites-all'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      setShowInviteClientDialog(false);
      setClientInviteEmail("");
      setClientCompanyName("");
    }
  });

  const revokeAccessMutation = useMutation({
    mutationFn: async ({ userId, reason }) => {
      await apiClient.update('User', userId, { role: "revoked" });
      return { userId, reason };
    },
    onSuccess: async (data) => {
      const user = users.find(u => u.id === data.userId);
      await apiClient.create('AuditLog', {
        actor_email: currentUser?.email,
        actor_name: currentUser?.full_name,
        action: "user_deleted",
        resource_type: "User",
        resource_id: data.userId,
        resource_name: user?.full_name,
        details: `Access revoked. Reason: ${data.reason}`
      });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      setShowRevokeDialog(false);
      setRevokeUser(null);
      setRevokeReason("");
    }
  });

  const filteredUsers = users.filter(user => {
    if (user.role === "revoked") return false;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const query = searchQuery.toLowerCase();
    return (
      log.actor_name?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.resource_name?.toLowerCase().includes(query)
    );
  });

  const roleColors = {
    admin: "bg-red-100 text-red-700 border-red-300",
    manager: "bg-blue-100 text-blue-700 border-blue-300",
    staff: "bg-green-100 text-green-700 border-green-300",
    user: "bg-gray-100 text-gray-700 border-gray-300"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            User Management
          </h2>
          <p className="text-gray-600">Manage user accounts, roles, permissions, and client access</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowInviteClientDialog(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <Building2 className="w-4 h-4 mr-2" /> Invite Client
          </Button>
          <Button onClick={() => setShowInviteDialog(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <UserPlus className="w-4 h-4 mr-2" /> Invite User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 border-0 shadow-lg">
          <div className="text-2xl font-bold text-gray-900">{filteredUsers.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </Card>
        <Card className="p-4 border-0 shadow-lg">
          <div className="text-2xl font-bold text-red-600">{users.filter(u => u.role === "admin").length}</div>
          <div className="text-sm text-gray-600">Admins</div>
        </Card>
        <Card className="p-4 border-0 shadow-lg">
          <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === "user").length}</div>
          <div className="text-sm text-gray-600">Regular Users</div>
        </Card>
        <Card className="p-4 border-0 shadow-lg">
          <div className="text-2xl font-bold text-purple-600">{clientInvites.filter(i => i.used).length}</div>
          <div className="text-sm text-gray-600">Client Accounts</div>
        </Card>
        <Card className="p-4 border-0 shadow-lg">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.created_date && new Date(u.created_date) > new Date(Date.now() - 7*24*60*60*1000)).length}
          </div>
          <div className="text-sm text-gray-600">New (7 days)</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="users">Internal Users</TabsTrigger>
          <TabsTrigger value="clients">Client Portal Accounts</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input placeholder="Search users by name, email, or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12" />
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No users found</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div><div className="font-medium text-gray-900">{user.full_name}</div></div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{user.email}</div></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge className={`${roleColors[user.role] || roleColors.user} border`}>{user.role}</Badge>
                            {user.role === "user" && user.permissions?.length > 0 && (
                              <Badge variant="outline" className="text-xs">{user.permissions.length} permissions</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{user.created_date ? format(new Date(user.created_date), 'MMM d, yyyy') : 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingUser(user); setEditPermissions(user.permissions || []); setShowEditDialog(true); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setRevokeUser(user); setShowRevokeDialog(true); }} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <UserX className="w-4 h-4 mr-1" /> Revoke
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
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <ClientAccountManager currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input placeholder="Search activity logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12" />
              </div>
            </div>
            <div className="space-y-4">
              {filteredAuditLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No activity logs found</div>
              ) : (
                filteredAuditLogs.slice(0, 50).map((log) => (
                  <div key={log.id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">{log.actor_name}</span>
                          <Badge variant="outline" className="text-xs">{log.action?.replace(/_/g, ' ')}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{log.resource_type}: <strong>{log.resource_name}</strong></p>
                        {log.details && <p className="text-xs text-gray-600">{log.details}</p>}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(log.created_date), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Client Dialog */}
      <Dialog open={showInviteClientDialog} onOpenChange={setShowInviteClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Client</DialogTitle>
            <DialogDescription>Send an invitation to join the client portal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900"><strong>Client Portal Access:</strong> This invitation grants access to the client portal where they can view their projects, documents, and communications.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Client Email</label>
              <Input type="email" value={clientInviteEmail} onChange={(e) => setClientInviteEmail(e.target.value)} placeholder="client@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <Input value={clientCompanyName} onChange={(e) => setClientCompanyName(e.target.value)} placeholder="Company Inc." />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowInviteClientDialog(false)}>Cancel</Button>
              <Button onClick={() => inviteClientMutation.mutate({ email: clientInviteEmail, companyName: clientCompanyName })} disabled={inviteClientMutation.isPending || !clientInviteEmail || !clientCompanyName} className="bg-purple-600 hover:bg-purple-700">
                {inviteClientMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Send Client Invitation</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>Send an invitation to join the internal portal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full Access</SelectItem>
                  <SelectItem value="user">User - Limited Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
              <Button onClick={() => inviteUserMutation.mutate({ email: inviteEmail, name: inviteName, role: inviteRole })} disabled={inviteUserMutation.isPending || !inviteEmail || !inviteName} className="bg-blue-600 hover:bg-blue-700">
                {inviteUserMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Send Invitation</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revoke Access Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke User Access</DialogTitle>
            <DialogDescription>This will immediately revoke access for {revokeUser?.full_name}</DialogDescription>
          </DialogHeader>
          {revokeUser && (
            <div className="space-y-4 py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Warning: This action is immediate</p>
                    <p className="text-xs text-red-700 mt-1">The user will be logged out and will not be able to access the portal.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Reason for Revocation</label>
                <Textarea value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)} placeholder="Enter reason for audit trail..." className="h-24" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>Cancel</Button>
                <Button onClick={() => revokeAccessMutation.mutate({ userId: revokeUser.id, reason: revokeReason })} disabled={revokeAccessMutation.isPending || !revokeReason.trim()} className="bg-red-600 hover:bg-red-700">
                  {revokeAccessMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Revoking...</> : <><UserX className="w-4 h-4 mr-2" />Revoke Access</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Role & Permissions Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Role & Permissions</DialogTitle>
            <DialogDescription>Configure role and granular permissions for {editingUser?.full_name}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Base Role</label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full Access (All Permissions)</SelectItem>
                    <SelectItem value="user">User - Custom Permissions</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Admin role automatically grants all permissions. User role requires manual permission assignment below.</p>
              </div>
              {editingUser.role === "user" && (
                <div className="border-t pt-4">
                  <PermissionsEditor user={editingUser} permissions={editPermissions} onChange={setEditPermissions} />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={async () => {
                    await apiClient.create('SystemLog', { type: 'user_permissions_sync', user_id: editingUser.id, user_email: editingUser.email, role: editingUser.role, permissions: editingUser.role === "admin" ? [] : editPermissions, status: 'synced', created_at: new Date().toISOString() });
                    await apiClient.create('AuditLog', { actor_email: currentUser?.email, actor_name: currentUser?.full_name, action: 'settings_changed', resource_type: 'CRM', resource_id: editingUser.id, resource_name: editingUser.full_name, details: 'Synced user role/permissions to CRM' });
                    alert('Synced with CRM');
                  }}>Sync with CRM</Button>
                  <Button onClick={() => { updateUserMutation.mutate({ userId: editingUser.id, updates: { role: editingUser.role, permissions: editingUser.role === "admin" ? [] : editPermissions } }); }} disabled={updateUserMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                    {updateUserMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><CheckCircle className="w-4 h-4 mr-2" />Save Changes</>}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}