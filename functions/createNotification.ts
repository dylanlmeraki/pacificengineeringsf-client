import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      recipient_email, 
      type, 
      title, 
      message, 
      link, 
      priority = 'normal',
      send_email = false,
      metadata = {}
    } = body;

    // Create in-app notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      recipient_email,
      type,
      title,
      message,
      link,
      priority,
      read: false,
      metadata
    });

    // Send email notification if requested
    if (send_email) {
      const emailSubject = `[Pacific Engineering] ${title}`;
      const emailBody = `
Hello,

${message}

${link ? `View details: ${Deno.env.get('FRONTEND_URL') || 'https://app.example.com'}${link}` : ''}

Best regards,
Pacific Engineering Team
      `.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient_email,
        from_name: 'Pacific Engineering',
        subject: emailSubject,
        body: emailBody
      });
    }

    return Response.json({ 
      success: true, 
      notification 
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});