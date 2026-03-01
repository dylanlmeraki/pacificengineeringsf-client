import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate the request
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      recipient_email, 
      type, 
      title, 
      message, 
      link, 
      priority = 'normal',
      metadata = {},
      send_email = true 
    } = await req.json();

    // Validate required fields
    if (!recipient_email || !type || !title || !message) {
      return Response.json({ 
        error: 'Missing required fields: recipient_email, type, title, message' 
      }, { status: 400 });
    }

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
      try {
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 15px; }
    .priority-urgent { background: #fee2e2; color: #991b1b; }
    .priority-high { background: #fed7aa; color: #9a3412; }
    .priority-normal { background: #dbeafe; color: #1e40af; }
    .priority-low { background: #e5e7eb; color: #374151; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Pacific Engineering</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Client Portal Notification</p>
    </div>
    <div class="content">
      ${priority !== 'normal' ? `<span class="priority-badge priority-${priority}">${priority.toUpperCase()} PRIORITY</span>` : ''}
      <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
      <p style="font-size: 16px; color: #4b5563;">${message}</p>
      ${link ? `<a href="${link}" class="button">View Details</a>` : ''}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        This is an automated notification from your Pacific Engineering Client Portal.
        ${link ? 'Click the button above or log in to your portal to view more details.' : 'Log in to your portal for more information.'}
      </p>
    </div>
    <div class="footer">
      <p>Pacific Engineering & Construction Inc.</p>
      <p>470 3rd St, San Francisco, CA 94107</p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
        You're receiving this because you have an active project with Pacific Engineering.
      </p>
    </div>
  </div>
</body>
</html>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipient_email,
          subject: `${priority === 'urgent' ? '🔴 URGENT: ' : priority === 'high' ? '⚠️ ' : ''}${title}`,
          body: emailBody
        });

      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    return Response.json({ 
      success: true, 
      notification_id: notification.id,
      email_sent: send_email 
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send notification' 
    }, { status: 500 });
  }
});