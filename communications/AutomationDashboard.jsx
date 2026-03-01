import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, CheckCircle, AlertCircle, Zap, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AutomationDashboard() {
  const queryClient = useQueryClient();

  const { data: scheduledNotifications = [] } = useQuery({
    queryKey: ['scheduled-notifications'],
    queryFn: async () => {
      try {
        return await base44.entities.ScheduledNotification.list('-scheduled_date', 100);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
        return [];
      }
    },
    initialData: []
  });

  const runAutomationMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const dueNotifications = scheduledNotifications.filter(
        n => !n.sent && new Date(n.scheduled_date) <= now
      );

      const results = [];
      for (const notification of dueNotifications) {
        try {
          await base44.integrations.Core.SendEmail({
            to: notification.recipient_email,
            from_name: "Pacific Engineering",
            subject: `${notification.notification_type}: ${notification.project_name}`,
            body: notification.custom_message || `
              <h2>${notification.notification_type}</h2>
              <p>Hi ${notification.recipient_name},</p>
              <p>This is a reminder regarding your project: <strong>${notification.project_name}</strong></p>
              <p>Scheduled for: ${format(new Date(notification.scheduled_date), 'PPP')}</p>
            `
          });

          await base44.entities.ScheduledNotification.update(notification.id, {
            sent: true,
            sent_date: new Date().toISOString()
          });

          results.push({ success: true, id: notification.id });
        } catch (error) {
          await base44.entities.ScheduledNotification.update(notification.id, {
            error: error.message
          });
          results.push({ success: false, id: notification.id, error: error.message });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      toast.success(`Sent ${successCount} notification(s)`);
    },
    onError: (error) => {
      console.error("Automation error:", error);
      toast.error("Failed to run automation");
    }
  });

  const pending = scheduledNotifications.filter(n => !n.sent && new Date(n.scheduled_date) > new Date());
  const overdue = scheduledNotifications.filter(n => !n.sent && new Date(n.scheduled_date) <= new Date());
  const sent = scheduledNotifications.filter(n => n.sent);
  const failed = scheduledNotifications.filter(n => n.error);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automation Dashboard</h2>
          <p className="text-gray-600">Monitor and manage automated communications</p>
        </div>
        <Button
          onClick={() => runAutomationMutation.mutate()}
          disabled={runAutomationMutation.isPending || overdue.length === 0}
          className="bg-gradient-to-r from-blue-600 to-cyan-600"
        >
          <Zap className="w-4 h-4 mr-2" />
          Run Automation Now
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">{pending.length}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Scheduled</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-8 h-8 text-orange-600" />
            <span className="text-3xl font-bold text-orange-600">{overdue.length}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Ready to Send</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-600">{sent.length}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Sent</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <span className="text-3xl font-bold text-red-600">{failed.length}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Failed</p>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {scheduledNotifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 p-4 rounded-r-lg ${
                  notification.sent
                    ? "border-green-500 bg-green-50"
                    : notification.error
                    ? "border-red-500 bg-red-50"
                    : new Date(notification.scheduled_date) <= new Date()
                    ? "border-orange-500 bg-orange-50"
                    : "border-blue-500 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{notification.notification_type}</Badge>
                      {notification.sent && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {notification.error && <AlertCircle className="w-4 h-4 text-red-600" />}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      To: {notification.recipient_name} ({notification.recipient_email})
                    </p>
                    <p className="text-xs text-gray-600">
                      Project: {notification.project_name}
                    </p>
                    {notification.error && (
                      <p className="text-xs text-red-600 mt-1">Error: {notification.error}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {notification.sent
                      ? format(new Date(notification.sent_date), 'MMM d, h:mm a')
                      : format(new Date(notification.scheduled_date), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}