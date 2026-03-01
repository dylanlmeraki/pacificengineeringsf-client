import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contactId } = body;

    if (!contactId) {
      return Response.json({ error: 'Contact ID required' }, { status: 400 });
    }

    // Fetch the contact
    const contacts = await base44.asServiceRole.entities.Contact.filter({ id: contactId });
    if (!contacts || contacts.length === 0) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }

    const contact = contacts[0];

    // Create prospect from contact
    const prospectData = {
      company_name: contact.company_name || contact.contact_name,
      contact_name: contact.contact_name,
      contact_email: contact.email || 'pending@import.com',
      contact_phone: contact.phone || undefined,
      company_location: [contact.city, contact.state].filter(Boolean).join(', ') || undefined,
      company_website: contact.website || undefined,
      linkedin_url: contact.linkedin || undefined,
      status: "New",
      lead_source: contact.lead_source || "Contact Import",
      services_interested: contact.services_interested || [],
      tags: [...(contact.tags || []), "Imported from Contacts"],
      uploaded_documents: [],
      notes: `
Imported from Contact Manager:

${contact.notes || 'No additional notes'}

Original Contact Details:
- Industry: ${contact.industry || 'N/A'}
- Referral Source: ${contact.referral_source || 'N/A'}
- Estimated Value: ${contact.estimated_value ? `$${contact.estimated_value}` : 'N/A'}
      `.trim(),
      prospect_score: 50,
      segment: "Warm Lead"
    };

    const newProspect = await base44.asServiceRole.entities.Prospect.create(prospectData);

    // Update contact to mark as imported
    await base44.asServiceRole.entities.Contact.update(contactId, {
      converted_to_project: true,
      notes: `${contact.notes || ''}\n\n[Imported to CRM as Prospect on ${new Date().toISOString()}]`
    });

    return Response.json({ 
      success: true,
      prospect: newProspect,
      message: `Successfully imported ${contact.contact_name} to CRM`
    });

  } catch (error) {
    console.error('Error importing contact:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});