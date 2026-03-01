import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Calendar, DollarSign, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  "Pending Client Approval": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Approved": "bg-green-100 text-green-700 border-green-300",
  "Rejected": "bg-red-100 text-red-700 border-red-300",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  "Completed": "bg-gray-100 text-gray-700 border-gray-300"
};

export default function MilestoneApproval({ milestone, onUpdate }) {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [comments, setComments] = useState("");
  const queryClient = useQueryClient();

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ milestoneId, updates }) => {
      const user = await base44.auth.me();
      const result = await base44.entities.ProjectMilestone.update(milestoneId, updates);
      
      // Create notification for admins
      const adminUsers = await base44.entities.User.filter({ role: 'admin' });
      const notificationType = updates.status === 'Approved' ? 'milestone_approval' : 'milestone_rejected';
      
      for (const admin of adminUsers) {
        await base44.entities.Notification.create({
          recipient_email: admin.email,
          type: notificationType,
          title: updates.status === 'Approved' ? 'Milestone Approved' : 'Milestone Rejected',
          message: `${user.full_name} ${updates.status === 'Approved' ? 'approved' : 'rejected'} milestone: ${milestone.milestone_name}`,
          link: `/ProjectDetail?id=${milestone.project_id}`,
          priority: 'normal',
          read: false,
          metadata: { 
            milestone_id: milestoneId,
            project_id: milestone.project_id,
            client_comments: updates.client_comments 
          }
        });
      }

      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: 'dylanl.peci@gmail.com',
        from_name: 'Pacific Engineering Portal',
        subject: `Milestone ${updates.status}: ${milestone.milestone_name}`,
        body: `
Client ${updates.status === 'Approved' ? 'approved' : 'rejected'} a milestone:

Milestone: ${milestone.milestone_name}
Client: ${user.full_name} (${user.email})
Status: ${updates.status}
${updates.client_comments ? `Comments: ${updates.client_comments}` : ''}

View project details in the admin portal.
        `.trim()
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project-milestones']);
      queryClient.invalidateQueries(['project-detail']);
      queryClient.invalidateQueries(['client-milestones']);
      setShowApprovalForm(false);
      setComments("");
      if (onUpdate) onUpdate();
    }
  });

  const handleApproval = (action) => {
    setApprovalAction(action);
    setShowApprovalForm(true);
  };

  const handleSubmitApproval = () => {
    const updates = {
      status: approvalAction === 'approve' ? 'Approved' : 'Rejected',
      client_approval_date: new Date().toISOString(),
      client_comments: comments
    };

    updateMilestoneMutation.mutate({
      milestoneId: milestone.id,
      updates
    });
  };

  const isPendingApproval = milestone.status === "Pending Client Approval";

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className={`h-1 ${
        milestone.status === 'Approved' ? 'bg-green-500' : 
        milestone.status === 'Rejected' ? 'bg-red-500' : 
        'bg-yellow-500'
      }`} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {milestone.milestone_name}
            </h3>
            <Badge className={`${statusColors[milestone.status]} border`}>
              {milestone.status}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-5">
          {milestone.description && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {milestone.description}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            {milestone.due_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {milestone.amount && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span>${milestone.amount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {milestone.completion_percentage > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Progress</span>
                <span className="text-xs font-bold text-gray-900">{milestone.completion_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${milestone.completion_percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Approval Actions */}
        {isPendingApproval && !showApprovalForm && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => handleApproval('approve')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleApproval('reject')}
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {/* Approval Form */}
        {showApprovalForm && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Comments (optional)
              </label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={`Add comments about ${approvalAction === 'approve' ? 'approving' : 'rejecting'} this milestone...`}
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleSubmitApproval}
                disabled={updateMilestoneMutation.isPending}
                className={`flex-1 ${
                  approvalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {updateMilestoneMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Confirm ${approvalAction === 'approve' ? 'Approval' : 'Rejection'}`
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowApprovalForm(false);
                  setComments("");
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Previous Approval Info */}
        {!isPendingApproval && milestone.client_approval_date && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">
                  {milestone.status === 'Approved' ? 'Approved' : 'Rejected'} on{' '}
                  {format(new Date(milestone.client_approval_date), 'MMM d, yyyy h:mm a')}
                </p>
                {milestone.client_comments && (
                  <p className="text-gray-600 mt-1">{milestone.client_comments}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}