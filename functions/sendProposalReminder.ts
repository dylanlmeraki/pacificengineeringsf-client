import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proposal_id } = await req.json();

    if (!proposal_id) {
      return Response.json({ error: 'proposal_id is required' }, { status: 400 });
    }

    // Get proposal with service role
    const proposals = await base44.asServiceRole.entities.Proposal.filter({ id: proposal_id });
    const proposal = proposals[0];

    if (!proposal) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check if proposal is in a state that needs reminders
    if (!['sent', 'viewed', 'awaiting_signature'].includes(proposal.status)) {
      return Response.json({ 
        error: 'Proposal must be in sent, viewed, or awaiting_signature status',
        status: proposal.status 
      }, { status: 400 });
    }

    // Send reminder emails to all recipients
    const emailsSent = [];
    for (const email of (proposal.recipient_emails || [])) {
      const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0B67A6 0%, #0EA5A4 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #0B67A6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .details { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⏰ Proposal Reminder</h1>
    </div>
    <div class="content">
      <h2>Hi there,</h2>
      <p>This is a friendly reminder about the proposal we sent you:</p>
      
      <div class="details">
        <strong>Proposal:</strong> ${proposal.title}<br>
        <strong>Number:</strong> ${proposal.proposal_number}<br>
        <strong>Amount:</strong> $${proposal.amount?.toLocaleString() || 'N/A'}<br>
        ${proposal.expiration_date ? `<strong>Expires:</strong> ${new Date(proposal.expiration_date).toLocaleDateString()}<br>` : ''}
      </div>

      <p>We haven't received a response yet and wanted to check if you had any questions or needed any clarification.</p>
      
      <p>If you're ready to move forward, please let us know!</p>

      <p style="margin-top: 30px;">
        <strong>Questions?</strong> Feel free to reach out:<br>
        📞 (415)-419-6079<br>
        📧 dylanl.peci@gmail.com
      </p>

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Pacific Engineering & Construction Inc.<br>
        470 3rd St, San Francisco, CA 94107
      </p>
    </div>
  </div>
</body>
</html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `⏰ Reminder: ${proposal.title} - Proposal #${proposal.proposal_number}`,
        body: emailBody
      });

      emailsSent.push(email);
    }

    // Update proposal with reminder tracking
    await base44.asServiceRole.entities.Proposal.update(proposal_id, {
      reminder_sent_count: (proposal.reminder_sent_count || 0) + 1,
      last_reminder_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      emails_sent: emailsSent,
      reminder_count: (proposal.reminder_sent_count || 0) + 1
    });

  } catch (error) {
    console.error('Error sending proposal reminder:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});