import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { format } from 'npm:date-fns@3.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { addresses, moreThanFive, serviceInterest, preferredContactDate, additionalDetails, uploadedFiles, contactEmail, contactName, contactPhone } = body;

    console.log('Consultation form data:', { 
      addressCount: addresses?.length,
      hasFiles: uploadedFiles?.length > 0,
      contactEmail,
      serviceInterest 
    });

    // Fetch email settings
    const emailSettings = await base44.asServiceRole.entities.EmailSettings.filter({
      form_type: "swppp_consultation",
      active: true
    });

    const recipients = emailSettings.length > 0 
      ? emailSettings[0].recipient_emails 
      : ["dylanllouis@gmail.com"];

    // Build formatted HTML email
    const locationsHtml = addresses.map((addr, i) => {
      return `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">📍 Project Location ${i + 1}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 5px 0;"><strong>Address:</strong></td><td>${addr.addressLine || 'Not provided'}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Zip Code:</strong></td><td>${addr.zipCode || 'Not provided'}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>State:</strong></td><td>${addr.state || 'CA'}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>County:</strong></td><td>${addr.county || 'Not provided'}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Size:</strong></td><td>${addr.approximateSize || 'Not provided'}</td></tr>
          </table>
        </div>`;
    }).join('');

    const filesHtml = uploadedFiles && uploadedFiles.length > 0 
      ? `
        <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">📎 Attached Documents (${uploadedFiles.length})</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${uploadedFiles.map(f => `
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <a href="${f.url}" style="color: #2563eb; text-decoration: none;">${f.name}</a>
              </li>
            `).join('')}
          </ul>
        </div>`
      : '';

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #06b6d4 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏗️ New SWPPP Consultation Request</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">Form submitted on ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">Project Locations</h2>
          ${locationsHtml}
          
          ${moreThanFive ? `
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <strong>More than 5 locations:</strong> ${moreThanFive}
            </div>
          ` : ''}

          <h2 style="color: #1e40af; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-top: 30px;">Service Details</h2>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 10px 0;"><strong>Service Interest:</strong> ${serviceInterest || 'Not provided'}</p>
            <p style="margin: 10px 0;"><strong>Preferred Contact Date:</strong> ${preferredContactDate ? format(new Date(preferredContactDate), 'PPP') : 'Not specified'}</p>
          </div>

          ${additionalDetails ? `
            <h2 style="color: #1e40af; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-top: 30px;">Additional Details</h2>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; white-space: pre-wrap;">
              ${additionalDetails}
            </div>
          ` : ''}

          ${filesHtml}
          
          <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #166534; font-size: 16px;">
              <strong>⏱️ Action Required:</strong> Please respond within 24-48 hours
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email to all configured recipients
    for (const recipient of recipients) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient,
        subject: `🏗️ New SWPPP Consultation Request - ${addresses[0]?.county || 'Location'} County`,
        body: emailBody
      });
    }

    // Create CRM Lead (Prospect)
    const finalContactEmail = contactEmail || "pending@inquiry.com";
    const finalContactName = contactName || "Consultation Request";
    const finalContactPhone = contactPhone || "";
    const primaryLocation = addresses.find(a => a.addressLine && a.county) || addresses[0];
    let prospect;
    try {
      const prospectData = {
        company_name: primaryLocation.addressLine || "SWPPP Consultation Inquiry",
        contact_name: finalContactName,
        contact_email: finalContactEmail,
        contact_phone: finalContactPhone || undefined,
        company_location: `${primaryLocation.county || 'Unknown'} County, ${primaryLocation.state || 'CA'}`,
        status: "New",
        lead_source: "Website Form",
        services_interested: serviceInterest ? [serviceInterest] : ["SWPPP Services"],
        segment: "Warm Lead",
        uploaded_documents: uploadedFiles || [],
        notes: `
    SWPPP Consultation Form Submission:

    Locations: ${addresses.length} location(s)
    ${addresses.map((addr, i) => `
    Location ${i + 1}:
    - Address: ${addr.addressLine || 'N/A'}
    - County: ${addr.county || 'N/A'}
    - Size: ${addr.approximateSize || 'N/A'}
    `).join('\n')}

    More than 5 locations: ${moreThanFive || 'N/A'}
    Preferred Contact: ${preferredContactDate ? format(new Date(preferredContactDate), 'PPP') : 'Not specified'}
    Documents Attached: ${uploadedFiles?.length || 0}

    Additional Details:
    ${additionalDetails || 'None'}

    Document Links:
    ${uploadedFiles?.map(f => `- ${f.name}: ${f.url}`).join('\n') || 'None'}
          `.trim()
            };

            console.log('Creating prospect with data:', prospectData);
            prospect = await base44.asServiceRole.entities.Prospect.create(prospectData);
            console.log('Prospect created successfully:', prospect.id);

      // Send confirmation email to user if we have their email
      if (finalContactEmail && finalContactEmail !== "pending@inquiry.com") {
        try {
          const confirmationEmail = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0B67A6 0%, #0EA5A4 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 14px 28px; background: #0B67A6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ SWPPP Consultation Request Received</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #0B67A6;"><strong>Hello${finalContactName !== "Consultation Request" ? ` ${finalContactName}` : ''},</strong></p>
      <p>Thank you for submitting your SWPPP consultation request. We've received your information for <strong>${addresses.length} location${addresses.length > 1 ? 's' : ''}</strong>.</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #0B67A6; margin: 20px 0;">
        <p style="margin: 0;"><strong>📋 What Happens Next:</strong></p>
        <ol style="margin-top: 10px; padding-left: 20px;">
          <li>Our team will review your project details</li>
          <li>We'll assess your SWPPP requirements</li>
          <li>You'll receive a detailed proposal within 24-48 hours</li>
        </ol>
      </div>

      <p>If you have any urgent questions, please call us at <strong>(415)-419-6079</strong>.</p>
      
      <p style="margin-top: 20px;">Best regards,<br><strong>Pacific Engineering Team</strong></p>
    </div>
    <div class="footer">
      <p>Pacific Engineering & Construction Inc.<br>470 3rd St., San Francisco, CA 94107<br>(415)-419-6079 | dylanl.peci@gmail.com</p>
    </div>
  </div>
</body>
</html>`;

          await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: "Pacific Engineering",
            to: finalContactEmail,
            subject: "✅ Your SWPPP Consultation Request - Pacific Engineering",
            body: confirmationEmail
          });
        } catch (emailError) {
          console.error('User confirmation email error:', emailError);
          // Continue even if email fails
        }
      }
    } catch (prospectError) {
    console.error('Prospect creation error:', prospectError);
    console.error('Error details:', prospectError.message, prospectError.stack);
    // Continue even if prospect creation fails
    }

    return Response.json({ 
      success: true,
      message: "Form submitted successfully" 
    });

  } catch (error) {
    console.error("Error submitting form:", error);
    console.error("Error stack:", error.stack);
    return Response.json({ 
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});