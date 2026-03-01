import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function WebhookMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: webhookLogs = [], isLoading, refetch } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      return await base44.entities.WebhookLog.list('-created_date', 100);
    },
    refetchInterval: autoRefresh ? 5000 : false
  });

  const statusColors = {
    success: "bg-green-100 text-green-700 border-green-300",
    failed: "bg-red-100 text-red-700 border-red-300",
    processing: "bg-blue-100 text-blue-700 border-blue-300"
  };

  const statusIcons = {
    success: <CheckCircle className="w-4 h-4" />,
    failed: <XCircle className="w-4 h-4" />,
    processing: <Clock className="w-4 h-4 animate-spin" />
  };

  const successRate = webhookLogs.length > 0
    ? ((webhookLogs.filter(l => l.status === 'success').length / webhookLogs.length) * 100).toFixed(1)
    : 0;

  const recentFailures = webhookLogs.filter(l => l.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Webhook Monitor</h3>
          <p className="text-gray-600">Track Stripe webhook events and payment processing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-gray-900">{webhookLogs.length}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-green-600">{successRate}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-red-600">{recentFailures}</div>
          <div className="text-sm text-gray-600">Failed Events</div>
        </Card>
      </div>

      {recentFailures > 0 && (
        <Card className="p-4 border-l-4 border-orange-500 bg-orange-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <p className="font-semibold text-orange-900">
              {recentFailures} webhook event{recentFailures > 1 ? 's' : ''} failed processing. Review below.
            </p>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {webhookLogs.map((log) => (
          <Card key={log.id} className="p-4 border-0 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`${statusColors[log.status]} border`}>
                    <span className="flex items-center gap-1">
                      {statusIcons[log.status]}
                      {log.status}
                    </span>
                  </Badge>
                  <span className="font-mono text-sm text-gray-600">{log.event_type}</span>
                  {log.invoice_number && (
                    <span className="text-sm text-gray-600">→ {log.invoice_number}</span>
                  )}
                </div>

                {log.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                    <p className="text-xs text-red-700 font-mono">{log.error_message}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Event ID: {log.event_id}</span>
                  {log.retry_count > 0 && (
                    <span className="text-orange-600">Retries: {log.retry_count}</span>
                  )}
                  <span>
                    {log.processed_at 
                      ? format(new Date(log.processed_at), 'MMM d, yyyy h:mm:ss a')
                      : format(new Date(log.created_date), 'MMM d, yyyy h:mm:ss a')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {webhookLogs.length === 0 && (
          <Card className="p-12 text-center border-0 shadow-lg">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No webhook events recorded yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}