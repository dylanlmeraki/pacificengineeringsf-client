import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSignature, CheckCircle2, Clock, AlertCircle, FileText, Loader2, PenSquare, XCircle, MessageSquare } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import MilestoneApproval from "./MilestoneApproval";
import ChangeOrderApproval from "./ChangeOrderApproval";
import DocumentSigner from "./DocumentSigner";

export default function ContractsApprovals({ user, projects }) {
  const [signingDocument, setSigningDocument] = useState(null);
  const [feedbackFor, setFeedbackFor] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const queryClient = useQueryClient();

  const approveDocMutation = useMutation({
    mutationFn: async ({ docId, status, comment }) => {
      const updateData = {
        status: status,
        ...(status === "Approved" ? { 
          approved_by: user?.email,
          approved_at: new Date().toISOString(),
          client_comments: comment 
        } : {
          rejected_by: user?.email,
          rejected_at: new Date().toISOString(),
          rejection_reason: comment
        })
      };
      await base44.entities.ProjectDocument.update(docId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client-documents-contracts']);
      queryClient.invalidateQueries(['approvals-milestones']);
      setFeedbackFor(null);
      setFeedbackComment("");
    }
  });

  const projectIds = projects.map(p => p.id);

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ['approvals-milestones', user?.email],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      const results = await Promise.all(
        projectIds.map(id => base44.entities.ProjectMilestone.filter({ project_id: id }))
      );
      return results.flat();
    },
    enabled: projectIds.length > 0
  });

  const { data: changeOrders = [], isLoading: changeOrdersLoading } = useQuery({
    queryKey: ['approvals-change-orders', user?.email],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      const results = await Promise.all(
        projectIds.map(id => base44.entities.ChangeOrder.filter({ project_id: id }))
      );
      return results.flat();
    },
    enabled: projectIds.length > 0
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['approvals-proposals', user?.email],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      const results = await Promise.all(
        projectIds.map(id => base44.entities.Proposal.filter({ project_id: id }))
      );
      return results.flat();
    },
    enabled: projectIds.length > 0
  });

  const { data: contractDocuments = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['client-documents-contracts', user?.email],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      const results = await Promise.all(
        projectIds.map(id => base44.entities.ProjectDocument.filter({ 
          project_id: id,
          document_type: 'Contract'
        }))
      );
      return results.flat();
    },
    enabled: projectIds.length > 0
  });

  const pendingMilestones = milestones.filter(m => m.status === "Pending Client Approval");
  const pendingChangeOrders = changeOrders.filter(co => co.status === "Pending Client Approval");
  const pendingProposals = proposals.filter(p => ['sent', 'viewed', 'awaiting_signature'].includes(p.status));
  const pendingContracts = contractDocuments.filter(d => d.status === "Under Review");

  const totalPending = pendingMilestones.length + pendingChangeOrders.length + pendingProposals.length + pendingContracts.length;
  const totalApproved = milestones.filter(m => m.status === "Completed").length + 
                        changeOrders.filter(co => co.status === "Approved").length +
                        proposals.filter(p => p.status === "signed").length +
                        contractDocuments.filter(d => d.status === "Approved").length;

  const isLoading = milestonesLoading || changeOrdersLoading || proposalsLoading || contractsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{totalPending}</span>
          </div>
          <p className="text-sm opacity-90">Pending Approvals</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{totalApproved}</span>
          </div>
          <p className="text-sm opacity-90">Approved Items</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <FileSignature className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">
              {milestones.length + changeOrders.length + proposals.length}
            </span>
          </div>
          <p className="text-sm opacity-90">Total Contracts</p>
        </Card>
      </div>

      {/* Action Required Alert */}
      {totalPending > 0 && (
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Action Required</h3>
              <p className="text-gray-700 mb-3">
                You have {totalPending} item{totalPending > 1 ? 's' : ''} awaiting your approval or signature.
              </p>
              <div className="flex gap-2 flex-wrap text-sm">
                {pendingMilestones.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-700">
                    {pendingMilestones.length} Milestone{pendingMilestones.length > 1 ? 's' : ''}
                  </Badge>
                )}
                {pendingChangeOrders.length > 0 && (
                  <Badge className="bg-purple-100 text-purple-700">
                    {pendingChangeOrders.length} Change Order{pendingChangeOrders.length > 1 ? 's' : ''}
                  </Badge>
                )}
                {pendingProposals.length > 0 && (
                  <Badge className="bg-green-100 text-green-700">
                    {pendingProposals.length} Proposal{pendingProposals.length > 1 ? 's' : ''}
                  </Badge>
                )}
                {pendingContracts.length > 0 && (
                  <Badge className="bg-orange-100 text-orange-700">
                    {pendingContracts.length} Contract{pendingContracts.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Contracts & Approvals Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({totalPending})
          </TabsTrigger>
          <TabsTrigger value="milestones">
            Milestones ({milestones.length})
          </TabsTrigger>
          <TabsTrigger value="change-orders">
            Change Orders ({changeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="proposals">
            Proposals ({proposals.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          {totalPending === 0 ? (
            <Card className="p-12 text-center border-0 shadow-lg">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending approvals at this time.</p>
            </Card>
          ) : (
            <>
              {pendingProposals.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Pending Proposals</h4>
                  <div className="space-y-4">
                    {pendingProposals.map(p => (
                      <Card key={p.id} className="p-6 border-0 shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h5>
                            {p.amount && (
                              <p className="text-2xl font-bold text-blue-600 mb-2">
                                ${p.amount.toLocaleString()}
                              </p>
                            )}
                            <div className="text-sm text-gray-600">
                              Sent {format(new Date(p.sent_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">
                            {p.status}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => window.location.href = createPageUrl("ClientPortal") + `?view=proposal&id=${p.id}`}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Review & Sign
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {pendingContracts.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-3">Pending Contracts</h4>
                  <div className="space-y-4">
                    {pendingContracts.map(doc => (
                      <Card key={doc.id} className="p-6 border-0 shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">{doc.document_name}</h5>
                            <div className="text-sm text-gray-600">
                              Uploaded {format(new Date(doc.created_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">
                            Needs Review
                          </Badge>
                        </div>

                        {/* Feedback section */}
                        {feedbackFor === doc.id ? (
                          <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
                            <Textarea
                              placeholder="Add comments or feedback (optional)..."
                              value={feedbackComment}
                              onChange={(e) => setFeedbackComment(e.target.value)}
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => approveDocMutation.mutate({ docId: doc.id, status: "Approved", comment: feedbackComment })}
                                disabled={approveDocMutation.isPending}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button
                                onClick={() => approveDocMutation.mutate({ docId: doc.id, status: "Rejected", comment: feedbackComment })}
                                disabled={approveDocMutation.isPending}
                                variant="destructive"
                                className="flex-1"
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                              <Button
                                onClick={() => { setFeedbackFor(null); setFeedbackComment(""); }}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        <div className="flex gap-3">
                          <Button
                            onClick={() => setSigningDocument(doc)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <PenSquare className="w-4 h-4 mr-2" />
                            Sign Document
                          </Button>
                          <Button
                            onClick={() => setFeedbackFor(doc.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Review & Approve
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {pendingMilestones.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-3">Pending Milestones</h4>
                  <div className="space-y-4">
                    {pendingMilestones.map(m => (
                      <MilestoneApproval key={m.id} milestone={m} />
                    ))}
                  </div>
                </div>
              )}

              {pendingChangeOrders.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-3">Pending Change Orders</h4>
                  <div className="space-y-4">
                    {pendingChangeOrders.map(co => (
                      <ChangeOrderApproval key={co.id} changeOrder={co} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones">
          {milestones.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-lg">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No milestones found</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {milestones.map(m => (
                <Card key={m.id} className="p-6 border-0 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{m.milestone_name}</h4>
                      {m.description && <p className="text-gray-700 mb-2">{m.description}</p>}
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {m.due_date && <span>Due: {format(new Date(m.due_date), 'MMM d, yyyy')}</span>}
                        {m.amount && <span>• ${m.amount.toLocaleString()}</span>}
                      </div>
                    </div>
                    <Badge className={
                      m.status === "Completed" ? "bg-green-100 text-green-700" :
                      m.status === "Pending Client Approval" ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-700"
                    }>
                      {m.status}
                    </Badge>
                  </div>
                  {m.status === "Pending Client Approval" && (
                    <MilestoneApproval milestone={m} />
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Change Orders Tab */}
        <TabsContent value="change-orders">
          {changeOrders.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-lg">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No change orders found</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {changeOrders.map(co => (
                <Card key={co.id} className="p-6 border-0 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{co.title}</h4>
                      {co.description && <p className="text-gray-700 mb-2">{co.description}</p>}
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {co.change_order_number && <span>#{co.change_order_number}</span>}
                        {co.cost_impact && <span>• ${co.cost_impact.toLocaleString()}</span>}
                      </div>
                    </div>
                    <Badge className={
                      co.status === "Approved" ? "bg-green-100 text-green-700" :
                      co.status === "Pending Client Approval" ? "bg-orange-100 text-orange-700" :
                      co.status === "Rejected" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }>
                      {co.status}
                    </Badge>
                  </div>
                  {co.status === "Pending Client Approval" && (
                    <ChangeOrderApproval changeOrder={co} />
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals">
          {proposals.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-lg">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No proposals found</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {proposals.map(p => (
                <Card key={p.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h4>
                      {p.amount && (
                        <p className="text-2xl font-bold text-blue-600 mb-2">
                          ${p.amount.toLocaleString()}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {p.proposal_number && <span>#{p.proposal_number}</span>}
                        {p.sent_date && <span>• Sent {format(new Date(p.sent_date), 'MMM d, yyyy')}</span>}
                        {p.signed_date && <span>• Signed {format(new Date(p.signed_date), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>
                    <Badge className={
                      p.status === "signed" ? "bg-green-100 text-green-700" :
                      p.status === "awaiting_signature" ? "bg-orange-100 text-orange-700" :
                      p.status === "declined" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }>
                      {p.status}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => window.location.href = createPageUrl("ClientPortal") + `?view=proposal&id=${p.id}`}
                    variant="outline"
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Proposal
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Document Signing Modal */}
      {signingDocument && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-2xl w-full my-8">
            <DocumentSigner
              documentId={signingDocument.id}
              documentType="contract"
              projectId={signingDocument.project_id}
              signerName={user?.full_name}
              signerEmail={user?.email}
              onSignComplete={() => {
                queryClient.invalidateQueries(['client-documents-contracts']);
                setSigningDocument(null);
              }}
            />
            <Button
              onClick={() => setSigningDocument(null)}
              variant="outline"
              className="w-full mt-4 bg-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}