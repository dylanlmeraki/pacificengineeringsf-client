import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Validate user is admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 403 });
    }

    const { email, name, phone, company, contact_id } = await req.json();

    // Validate required fields
    if (!email || !name) {
      return Response.json({ 
        success: false, 
        error: 'Email and name are required' 
      }, { status: 400 });
    }

    // Check if invite already exists
    const existingInvites = await base44.asServiceRole.entities.ClientInvite.filter({ 
      email: email.toLowerCase().trim() 
    });

    let invite;
    if (existingInvites.length > 0) {
      // Resend existing invite
      invite = existingInvites[0];
    } else {
      // Create new invite with unique token
      const inviteToken = crypto.randomUUID();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // 30 days expiration

      invite = await base44.asServiceRole.entities.ClientInvite.create({
        email: email.toLowerCase().trim(),
        name: name,
        phone: phone || '',
        company: company || '',
        contact_id: contact_id || null,
        invite_token: inviteToken,
        status: 'pending',
        expires_at: expirationDate.toISOString(),
        invited_by: user.email
      });
    }

    // Generate portal registration URL
    const appUrl = Deno.env.get('BASE44_APP_URL') || 'https://your-app-url.com';
    const portalUrl = `${appUrl}/#/PortalRegister?token=${invite.invite_token}`;

    // Send invite email
    const inviteEmail = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0B67A6 0%, #0EA5A4 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 16px 32px; background: #0B67A6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
    .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Pacific Engineering</h1>
      <p style="margin: 10px 0 0 0; color: #e0f2fe;">Your Client Portal is Ready!</p>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #0B67A6;"><strong>Hello ${name},</strong></p>
      <p>You've been invited to access Pacific Engineering's secure Client Portal. This powerful platform gives you complete visibility and control over your projects.</p>
      
      <div class="features">
        <p style="margin: 0 0 10px 0;"><strong>📊 What You Can Do:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Track project status and progress in real-time</li>
          <li>View and approve proposals and change orders</li>
          <li>Access project documents and reports</li>
          <li>Communicate directly with your project team</li>
          <li>Upload files and share information securely</li>
          <li>Review milestones and payment schedules</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${portalUrl}" class="button">🔐 Activate Your Portal Access</a>
      </div>

      <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>⏰ Important:</strong> This invitation link expires in 30 days. Please complete your registration soon.</p>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #666;">If you have any questions or need assistance, contact us at <strong>(415)-419-6079</strong> or reply to this email.</p>
      
      <p style="margin-top: 20px;">Looking forward to working with you!</p>
      <p><strong>The Pacific Engineering Team</strong></p>
    </div>
    <div class="footer">
      <p>Pacific Engineering & Construction Inc.<br>470 3rd St., San Francisco, CA 94107<br>(415)-419-6079 | dylanl.peci@gmail.com</p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: "Pacific Engineering",
        to: email,
        subject: "🎉 Your Pacific Engineering Client Portal Invitation",
        body: inviteEmail
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Continue even if email fails - invite is created
    }

    // Log audit trail
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        actor_email: user.email,
        actor_name: user.full_name,
        action: 'client_invite_created',
        resource_type: 'ClientInvite',
        resource_id: invite.id,
        resource_name: email,
        details: `Client invite sent to ${email} for ${name}`
      });
    } catch (logError) {
      console.error('Audit log error:', logError);
      // Continue even if logging fails
    }

    return Response.json({ 
      success: true,
      invite_id: invite.id,
      portal_url: portalUrl,
      expires_at: invite.expires_at
    });

  } catch (error) {
    console.error('Create client invite error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to create client invite'
    }, { status: 500 });
  }
});