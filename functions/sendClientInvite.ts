import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, companyName, invitedByName } = body;

    if (!email || !companyName) {
      return Response.json({ error: 'Email and company name required' }, { status: 400 });
    }

    // Generate unique invite token using crypto
    const inviteToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invite record
    const invite = await base44.asServiceRole.entities.ClientInvite.create({
      invite_token: inviteToken,
      email,
      company_name: companyName,
      invited_by_email: user.email,
      invited_by_name: invitedByName || user.full_name,
      expires_at: expiresAt.toISOString(),
      used: false
    });

    // Send invitation email
    const inviteLink = `${Deno.env.get('APP_URL') || 'https://pacificengineeringsf.com'}/PortalRegister?token=${inviteToken}`;
    
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'Pacific Engineering',
      subject: '🏗️ Your Client Portal Invitation - Pacific Engineering',
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0B67A6 0%, #0EA5A4 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 40px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 14px 28px; background: #0B67A6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
    .token { background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Pacific Engineering Client Portal</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #0B67A6;"><strong>Hello,</strong></p>
      <p>You've been invited by <strong>${invitedByName || user.full_name}</strong> to create a Client Portal account for <strong>${companyName}</strong>.</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #0B67A6; margin: 20px 0;">
        <p style="margin: 0;"><strong>🌟 Your Client Portal Benefits:</strong></p>
        <ul style="margin-top: 10px;">
          <li>View real-time project progress</li>
          <li>Access important documents securely</li>
          <li>Review and approve milestones</li>
          <li>Communicate directly with our team</li>
          <li>Track invoices and payments</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" class="button">Create Your Account</a>
      </div>

      <p><strong>Your Unique Invite Token:</strong></p>
      <div class="token">${inviteToken}</div>
      <p style="font-size: 12px; color: #666;">You'll need this token to complete your registration. This invitation expires in 7 days.</p>

      <p style="margin-top: 20px;">If you have any questions, please contact us at <strong>(415)-419-6079</strong>.</p>
      
      <p style="margin-top: 20px;">Best regards,<br><strong>Pacific Engineering Team</strong></p>
    </div>
    <div class="footer">
      <p>Pacific Engineering & Construction Inc.<br>470 3rd St., San Francisco, CA 94107<br>(415)-419-6079 | dylanl.peci@gmail.com</p>
    </div>
  </div>
</body>
</html>`
    });

    // Log the action
    await base44.asServiceRole.entities.AuditLog.create({
      actor_email: user.email,
      actor_name: user.full_name,
      action: 'user_created',
      resource_type: 'ClientInvite',
      resource_name: email,
      details: `Sent client portal invitation to ${email} for ${companyName}`
    });

    return Response.json({ 
      success: true,
      invite,
      message: `Invitation sent to ${email}`
    });

  } catch (error) {
    console.error('Error sending client invite:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});