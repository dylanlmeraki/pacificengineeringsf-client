import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, CheckCircle2, Bell } from "lucide-react";

export default function SendProjectUpdate({ project }) {
  const [updateType, setUpdateType] = useState("general");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateTypes = [
    { value: "status_change", label: "Status Change" },
    { value: "milestone_complete", label: "Milestone Completed" },
    { value: "document_added", label: "New Document" },
    { value: "message_received", label: "New Message" },
    { value: "approval_needed", label: "Approval Required" },
    { value: "schedule_change", label: "Schedule Change" },
    { value: "budget_update", label: "Budget Update" },
    { value: "general", label: "General Update" }
  ];

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    setSuccess(false);

    try {
      await base44.functions.invoke('notifyProjectUpdate', {
        project_id: project.id,
        update_type: updateType,
        update_message: message,
        priority: priority
      });

      setSuccess(true);
      setMessage("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to send update:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Send Project Update</h3>
          <p className="text-sm text-gray-600">Notify client via app and email</p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Notification sent successfully!</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Update Type</label>
          <Select value={updateType} onValueChange={setUpdateType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {updateTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter update message for the client..."
            className="min-h-[120px]"
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Client will receive both an in-app notification and an email
        </p>
      </div>
    </Card>
  );
}