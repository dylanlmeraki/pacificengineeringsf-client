import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import AdminRoute from "../components/internal/AdminRoute";
import InternalLayout from "../components/internal/InternalLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Copy, CheckCircle, Clock, XCircle, Send, Loader2 } from "lucide-react";

export default function ClientInvites() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");

  const { data: invites = [] } = useQuery({
    queryKey: ['clientInvites'],
    queryFn: () => base44.entities.ClientInvite.list('-created_date', 100),
    initialData: []
  });

  const createInviteMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      
      const invite = await base44.entities.ClientInvite.create({
        invite_token: token,
        email: email.toLowerCase(),
        company_name: companyName,
        invited_by_email: user.email,
        invited_by_name: user.full_name,
        expires_at: expiresAt,
        used: false
      });

      // Send email with invite link
      const inviteUrl = `${window.location.origin}/portal-register?token=${token}`;
      
      await base44.integrations.Core.SendEmail({
        to: email,
        from_name: "Pacific Engineering",
        subject: "You're invited to Pacific Engineering Client Portal",
        body: `Hello,

You've been invited to join the Pacific Engineering Client Portal.

Click here to create your account: ${inviteUrl}

This invitation expires in 72 hours.

Best regards,
Pacific Engineering Team`
      });

      return invite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientInvites'] });
      setEmail("");
      setCompanyName("");
    }
  });

  const copyInviteLink = (token) => {
    const url = `${window.location.origin}/portal-register?token=${token}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <AdminRoute>
      <InternalLayout>
        <div className="p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Client Invitations</h1>
              <p className="text-gray-600 text-lg">Send portal access invitations to clients</p>
            </div>

            <Card className="p-8 mb-8 border-0 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Send className="w-6 h-6 text-blue-600" />
                Send New Invitation
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Inc."
                  />
                </div>
              </div>

              <Button
                onClick={() => createInviteMutation.mutate()}
                disabled={!email || !companyName || createInviteMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createInviteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation Email
                  </>
                )}
              </Button>
            </Card>

            <Card className="p-8 border-0 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Invitation History</h2>
              
              <div className="space-y-3">
                {invites.map(invite => {
                  const isExpired = new Date(invite.expires_at) < new Date();
                  
                  return (
                    <div key={invite.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{invite.email}</h4>
                            <Badge className={
                              invite.used ? 'bg-green-100 text-green-700' :
                              isExpired ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }>
                              {invite.used ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Used
                                </>
                              ) : isExpired ? (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Expired
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Company: {invite.company_name}</p>
                            <p>Invited by: {invite.invited_by_name} ({invite.invited_by_email})</p>
                            <p>Created: {new Date(invite.created_date).toLocaleString()}</p>
                            <p>Expires: {new Date(invite.expires_at).toLocaleString()}</p>
                            {invite.used && invite.used_at && (
                              <p className="text-green-600">Used: {new Date(invite.used_at).toLocaleString()}</p>
                            )}
                          </div>
                        </div>

                        {!invite.used && !isExpired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInviteLink(invite.invite_token)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </InternalLayout>
    </AdminRoute>
  );
}