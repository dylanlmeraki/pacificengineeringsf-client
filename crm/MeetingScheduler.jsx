import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  X
} from "lucide-react";
import scheduleMeeting from "../../functions/scheduleMeeting";

export default function MeetingScheduler({ prospect, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    meetingTitle: `Discovery Call with ${prospect.company_name}`,
    meetingDescription: "Discuss stormwater compliance, construction, and engineering needs",
    startTime: "",
    duration: 30,
    meetingType: "Discovery Call"
  });
  const [showSettings, setShowSettings] = useState(false);

  // Fetch calendar settings
  const { data: settings } = useQuery({
    queryKey: ['calendar-settings'],
    queryFn: async () => {
      const allSettings = await base44.entities.CalendarSettings.list();
      return allSettings.length > 0 ? allSettings[0] : null;
    }
  });

  const scheduleMeetingMutation = useMutation({
    mutationFn: async (data) => {
      const result = await scheduleMeeting({
        prospect,
        ...data,
        settings: settings || { provider: "none" }
      });
      return result;
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['prospects'] });
        queryClient.invalidateQueries({ queryKey: ['interactions'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        if (onSuccess) onSuccess(result);
      }
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      if (settings?.id) {
        return await base44.entities.CalendarSettings.update(settings.id, newSettings);
      } else {
        return await base44.entities.CalendarSettings.create(newSettings);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-settings'] });
      setShowSettings(false);
    }
  });

  const handleSchedule = () => {
    scheduleMeetingMutation.mutate(formData);
  };

  // Generate time slots for today and next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      // Business hours: 9 AM - 5 PM
      for (let hour = 9; hour <= 17; hour++) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, 0, 0, 0);
        
        // Skip past times
        if (slotTime > now) {
          slots.push(slotTime);
        }
      }
    }
    
    return slots.slice(0, 20); // Show first 20 slots
  };

  const timeSlots = generateTimeSlots();

  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 bg-white rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Calendar Settings
            </h2>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Calendar Provider
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => updateSettingsMutation.mutate({ ...settings, provider: "google" })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    settings?.provider === "google"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📅</div>
                    <h3 className="font-bold text-gray-900 mb-1">Google Calendar</h3>
                    <p className="text-xs text-gray-600">Schedule via Google Meet</p>
                  </div>
                </button>

                <button
                  onClick={() => updateSettingsMutation.mutate({ ...settings, provider: "calendly" })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    settings?.provider === "calendly"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗓️</div>
                    <h3 className="font-bold text-gray-900 mb-1">Calendly</h3>
                    <p className="text-xs text-gray-600">Share Calendly link</p>
                  </div>
                </button>

                <button
                  onClick={() => updateSettingsMutation.mutate({ ...settings, provider: "none" })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    settings?.provider === "none" || !settings
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📧</div>
                    <h3 className="font-bold text-gray-900 mb-1">Manual</h3>
                    <p className="text-xs text-gray-600">Email only</p>
                  </div>
                </button>
              </div>
            </div>

            {settings?.provider === "google" && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Google Calendar Setup</h4>
                <p className="text-sm text-blue-800 mb-3">
                  To enable Google Calendar integration, you'll need to set up OAuth credentials in your Google Cloud Console.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="your-email@gmail.com"
                    value={settings.google_calendar_id || ""}
                    onChange={(e) => updateSettingsMutation.mutate({ 
                      ...settings, 
                      google_calendar_id: e.target.value 
                    })}
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            {settings?.provider === "calendly" && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Calendly Setup</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Enter your Calendly event type URI. You can find this in your Calendly settings.
                </p>
                <Input
                  placeholder="https://calendly.com/your-username/30min"
                  value={settings.calendly_event_type_uri || ""}
                  onChange={(e) => updateSettingsMutation.mutate({ 
                    ...settings, 
                    calendly_event_type_uri: e.target.value 
                  })}
                  className="bg-white"
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Meeting Duration
                </label>
                <Select 
                  value={settings?.default_meeting_duration?.toString() || "30"}
                  onValueChange={(value) => updateSettingsMutation.mutate({ 
                    ...settings, 
                    default_meeting_duration: parseInt(value)
                  })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <Select 
                  value={settings?.timezone || "America/Los_Angeles"}
                  onValueChange={(value) => updateSettingsMutation.mutate({ 
                    ...settings, 
                    timezone: value
                  })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="auto-interaction"
                checked={settings?.auto_create_interaction !== false}
                onChange={(e) => updateSettingsMutation.mutate({
                  ...settings,
                  auto_create_interaction: e.target.checked
                })}
                className="w-4 h-4"
              />
              <label htmlFor="auto-interaction" className="text-sm text-gray-700">
                Automatically create interaction record when meeting is scheduled
              </label>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="auto-task"
                checked={settings?.auto_create_task !== false}
                onChange={(e) => updateSettingsMutation.mutate({
                  ...settings,
                  auto_create_task: e.target.checked
                })}
                className="w-4 h-4"
              />
              <label htmlFor="auto-task" className="text-sm text-gray-700">
                Automatically create preparation task before meeting
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Done
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (scheduleMeetingMutation.isSuccess && scheduleMeetingMutation.data.success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 bg-white rounded-2xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meeting Scheduled!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Your meeting with {prospect.contact_name} has been scheduled and a confirmation email has been sent.
          </p>

          {scheduleMeetingMutation.data.meeting_link && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Video className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Meeting Link</h3>
              </div>
              <a
                href={scheduleMeetingMutation.data.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline flex items-center justify-center gap-2"
              >
                {scheduleMeetingMutation.data.meeting_link}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button onClick={onClose}>Close</Button>
            {scheduleMeetingMutation.data.meeting_link && (
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(scheduleMeetingMutation.data.meeting_link);
                }}
              >
                Copy Link
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full p-8 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Schedule Meeting
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-5 rounded-r-xl mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{prospect.contact_name}</h3>
              <p className="text-sm text-gray-600">{prospect.contact_title} at {prospect.company_name}</p>
              <p className="text-sm text-blue-600 mt-1">{prospect.contact_email}</p>
            </div>
            <Badge className={settings?.provider === "none" || !settings ? "bg-gray-500" : "bg-green-500"}>
              {settings?.provider === "google" && "📅 Google Calendar"}
              {settings?.provider === "calendly" && "🗓️ Calendly"}
              {(!settings || settings?.provider === "none") && "📧 Email Only"}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meeting Type
            </label>
            <Select value={formData.meetingType} onValueChange={(value) => setFormData({...formData, meetingType: value})}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Discovery Call">Discovery Call</SelectItem>
                <SelectItem value="Demo">Demo</SelectItem>
                <SelectItem value="Proposal Review">Proposal Review</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Check-in">Check-in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meeting Title
            </label>
            <Input
              value={formData.meetingTitle}
              onChange={(e) => setFormData({...formData, meetingTitle: e.target.value})}
              className="h-12"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Agenda / Description
            </label>
            <Textarea
              value={formData.meetingDescription}
              onChange={(e) => setFormData({...formData, meetingDescription: e.target.value})}
              rows={4}
              placeholder="What will you discuss in this meeting?"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration
              </label>
              <Select value={formData.duration.toString()} onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Time Slots */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Quick Select Time Slot
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {timeSlots.slice(0, 8).map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setFormData({
                    ...formData,
                    startTime: new Date(slot.getTime() - slot.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                  })}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="text-xs text-gray-600">{slot.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="font-medium text-gray-900">{slot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                </button>
              ))}
            </div>
          </div>

          {scheduleMeetingMutation.isError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Error Scheduling Meeting</h4>
                  <p className="text-sm text-red-800 mt-1">
                    {scheduleMeetingMutation.data?.error || scheduleMeetingMutation.error?.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSchedule}
              disabled={!formData.startTime || !formData.meetingTitle || scheduleMeetingMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {scheduleMeetingMutation.isPending ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Schedule Meeting
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}