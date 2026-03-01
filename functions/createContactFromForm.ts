import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { formData, source } = await req.json();

    // Create or update contact
    const existingContacts = await base44.asServiceRole.entities.Contact.filter({ 
      email: formData.email 
    });

    let contact;
    if (existingContacts.length > 0) {
      // Update existing contact
      contact = existingContacts[0];
      await base44.asServiceRole.entities.Contact.update(contact.id, {
        contact_name: formData.name || contact.contact_name,
        phone: formData.phone || contact.phone,
        company_name: formData.company || contact.company_name,
        last_contact_date: new Date().toISOString(),
        lead_source: source || contact.lead_source,
        status: contact.status === 'New' ? 'Contacted' : contact.status,
        services_interested: formData.serviceInterest ? 
          [...new Set([...(contact.services_interested || []), formData.serviceInterest])] : 
          contact.services_interested
      });
    } else {
      // Create new contact
      contact = await base44.asServiceRole.entities.Contact.create({
        contact_name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        company_name: formData.company || '',
        contact_type: 'Lead',
        status: 'New',
        lead_source: source || 'Website Form',
        services_interested: formData.serviceInterest ? [formData.serviceInterest] : [],
        notes: formData.message || ''
      });
    }

    // Create activity record
    try {
      await base44.asServiceRole.entities.Activity.create({
        contact_id: contact.id,
        activity_type: 'Email',
        subject: `${source || 'Website'} Form Submission`,
        description: formData.message || 'Contact form inquiry',
        status: 'Completed',
        priority: 'High'
      });
    } catch (activityError) {
      console.error('Activity creation error:', activityError);
      // Continue even if activity creation fails
    }

    // Create task for follow-up
    try {
      const taskDate = new Date();
      taskDate.setDate(taskDate.getDate() + 1);

      await base44.asServiceRole.entities.Task.create({
        prospect_id: contact.id,
        prospect_name: formData.name,
        company_name: formData.company || '',
        task_type: "Follow-up Email",
        title: `Follow up with ${formData.name} - ${source || 'Website'} inquiry`,
        description: `Contact submitted inquiry about ${formData.serviceInterest || 'services'}. ${formData.message ? 'Message: ' + formData.message.substring(0, 200) : ''}`,
        priority: "High",
        status: "Pending",
        due_date: taskDate.toISOString(),
        automated: true
      });
    } catch (taskError) {
      console.error('Task creation error:', taskError);
      // Continue even if task creation fails
    }

    return Response.json({ 
      success: true, 
      contact_id: contact.id,
      is_new: existingContacts.length === 0
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});