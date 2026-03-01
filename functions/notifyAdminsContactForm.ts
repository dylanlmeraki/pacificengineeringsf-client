import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { name, email, phone, company, serviceInterest, projectType, message, uploadedFiles } = body;

    console.log('Contact form data:', { 
      name, 
      email, 
      serviceInterest,
      hasFiles: uploadedFiles?.length > 0
    });

    // Create CRM Lead (Prospect)
    try {
      const prospectData = {
        company_name: company || "Contact Form Inquiry",
        contact_name: name,
        contact_email: email,
        contact_phone: phone || undefined,
        status: "New",
        lead_source: "Website",
        services_interested: serviceInterest ? [serviceInterest] : [],
        segment: "Warm Lead",
        uploaded_documents: uploadedFiles || [],
        notes: `
Contact Form Submission:

Service Interest: ${serviceInterest || 'Not specified'}
Project Type: ${projectType || 'Not specified'}
Documents Attached: ${uploadedFiles?.length || 0}

Message:
${message || 'No message'}

Document Links:
${uploadedFiles?.map(f => `- ${f.name}: ${f.url}`).join('\n') || 'None'}
        `.trim()
      };

      console.log('Creating prospect with data:', prospectData);
      await base44.asServiceRole.entities.Prospect.create(prospectData);
      console.log('Prospect created successfully');
    } catch (error) {
      console.error('Error creating prospect from contact form:', error);
      console.error('Error details:', error.message, error.stack);
      // Continue even if prospect creation fails - form submission should still succeed
    }

    // Create notifications for all admins
    const adminUsers = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    
    for (const admin of adminUsers) {
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: admin.email,
        type: 'contact_form',
        title: 'New Contact Form Submission',
        message: `${name} ${company ? `from ${company}` : ''} submitted a contact form for ${serviceInterest}`,
        priority: 'high',
        read: false,
        metadata: { 
          contact_email: email, 
          phone, 
          service: serviceInterest,
          project_type: projectType 
        }
      });
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error in notifyAdminsContactForm:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});