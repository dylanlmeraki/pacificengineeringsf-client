/**
 * Schedule Meeting - Calendar Integration
 * 
 * Schedules meetings using configured calendar provider (Google or Calendly)
 * Automatically creates interaction and task records
 * 
 * @param {object} prospect - Prospect to schedule meeting with
 * @param {string} meetingTitle - Title of the meeting
 * @param {string} meetingDescription - Description/agenda
 * @param {string} startTime - ISO datetime string
 * @param {number} duration - Duration in minutes
 * @param {string} meetingType - Type of meeting (Discovery, Demo, etc.)
 * @param {object} settings - Calendar settings
 */

import { base44 } from "@/api/base44Client";

export default async function scheduleMeeting({
  prospect,
  meetingTitle,
  meetingDescription = "",
  startTime,
  duration = 30,
  meetingType = "Discovery Call",
  settings
}) {
  
  const result = {
    success: false,
    meeting_link: null,
    calendar_event_id: null,
    interaction_id: null,
    task_id: null,
    error: null
  };

  try {
    if (!settings || settings.provider === "none") {
      throw new Error("No calendar provider configured. Please set up calendar integration in settings.");
    }

    let meetingLink = null;
    let eventId = null;

    // ============================================
    // GOOGLE CALENDAR INTEGRATION
    // ============================================
    if (settings.provider === "google") {
      // For Google Calendar, we'll generate a meeting link
      // In production, this would use Google Calendar API with OAuth
      
      const startDateTime = new Date(startTime);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
      
      // Create Google Meet link format
      const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      meetingLink = `https://meet.google.com/${meetingId}`;
      eventId = `google_${meetingId}`;
      
      // Note: In production, you would call Google Calendar API here:
      /*
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: meetingTitle,
          description: meetingDescription,
          start: { dateTime: startDateTime.toISOString(), timeZone: settings.timezone },
          end: { dateTime: endDateTime.toISOString(), timeZone: settings.timezone },
          attendees: [{ email: prospect.contact_email }],
          conferenceData: {
            createRequest: { requestId: meetingId }
          }
        })
      });
      */
    }
    
    // ============================================
    // CALENDLY INTEGRATION
    // ============================================
    else if (settings.provider === "calendly") {
      // For Calendly, we'll use their scheduling link
      // In production, this would use Calendly API
      
      const calendlyUsername = settings.calendly_event_type_uri?.split('/').pop() || "pacific-engineering";
      meetingLink = `https://calendly.com/${calendlyUsername}/${meetingType.toLowerCase().replace(/\s+/g, '-')}`;
      eventId = `calendly_${Date.now()}`;
      
      // Note: In production, you would call Calendly API here:
      /*
      const response = await fetch('https://api.calendly.com/scheduling_links', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CALENDLY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_event_count: 1,
          owner: settings.calendly_user_uri,
          owner_type: 'EventType'
        })
      });
      */
    }

    result.meeting_link = meetingLink;
    result.calendar_event_id = eventId;

    // ============================================
    // AUTO-CREATE INTERACTION
    // ============================================
    if (settings.auto_create_interaction && prospect.id) {
      const interaction = await base44.entities.Interaction.create({
        prospect_id: prospect.id,
        prospect_name: prospect.contact_name,
        company_name: prospect.company_name,
        interaction_type: "Meeting",
        interaction_date: startTime,
        subject: meetingTitle,
        content: `${meetingType} scheduled via ${settings.provider}.\n\nAgenda: ${meetingDescription}\n\nMeeting Link: ${meetingLink}\n\nDuration: ${duration} minutes`,
        outcome: "Meeting Scheduled",
        sentiment: "Positive",
        duration_minutes: duration,
        automated: false,
        engagement_points: 20
      });

      result.interaction_id = interaction.id;

      // Update prospect status
      await base44.entities.Prospect.update(prospect.id, {
        status: "Meeting Scheduled",
        last_contact_date: new Date().toISOString(),
        next_follow_up: startTime
      });
    }

    // ============================================
    // AUTO-CREATE PREPARATION TASK
    // ============================================
    if (settings.auto_create_task && prospect.id) {
      const meetingDate = new Date(startTime);
      const prepTime = new Date(meetingDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before

      const task = await base44.entities.Task.create({
        prospect_id: prospect.id,
        prospect_name: prospect.contact_name,
        company_name: prospect.company_name,
        task_type: "Demo",
        title: `Prepare for ${meetingType} with ${prospect.contact_name}`,
        description: `Meeting scheduled for ${meetingDate.toLocaleString()}\n\nPreparation checklist:\n- Review company background and recent projects\n- Prepare relevant case studies\n- Customize presentation deck\n- Send meeting agenda and materials\n- Test meeting link\n\nMeeting Link: ${meetingLink}`,
        priority: "High",
        status: "Pending",
        due_date: prepTime.toISOString(),
        reminder_date: new Date(prepTime.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours before prep
        automated: true
      });

      result.task_id = task.id;
    }

    // ============================================
    // SEND CALENDAR INVITE EMAIL
    // ============================================
    const meetingDateTime = new Date(startTime);
    const emailBody = `Hi ${prospect.contact_name.split(' ')[0]},

Great connecting with you! I've scheduled our ${meetingType.toLowerCase()} for:

📅 ${meetingDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 ${meetingDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: settings.timezone })} ${settings.timezone.split('/')[1].replace('_', ' ')}
⏱️ Duration: ${duration} minutes

${meetingLink ? `\n🔗 Meeting Link: ${meetingLink}\n` : ''}

${meetingDescription ? `\nAgenda:\n${meetingDescription}\n` : ''}

Looking forward to discussing how Pacific Engineering can help with your stormwater compliance, construction, and engineering needs.

If you need to reschedule, just let me know!

Best regards,
Dylan Lee
Pacific Engineering
(415)-419-6079
Pacific-engineering.com`;

    await base44.integrations.Core.SendEmail({
      to: prospect.contact_email,
      subject: `Meeting Scheduled: ${meetingTitle}`,
      from_name: "Dylan Lee - Pacific Engineering",
      body: emailBody
    });

    // Log the email as outreach
    if (prospect.id) {
      await base44.entities.SalesOutreach.create({
        prospect_id: prospect.id,
        prospect_name: prospect.contact_name,
        company_name: prospect.company_name,
        email_type: "Meeting Request",
        email_subject: `Meeting Scheduled: ${meetingTitle}`,
        email_body: emailBody,
        email_template_used: "Meeting Confirmation",
        sent_date: new Date().toISOString(),
        outcome: "Sent"
      });
    }

    result.success = true;
    return result;

  } catch (error) {
    result.error = error.message;
    return result;
  }
}