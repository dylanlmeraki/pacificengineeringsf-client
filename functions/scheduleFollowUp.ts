import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contact_id, days_offset, task_type, priority } = await req.json();

    const contact = await base44.asServiceRole.entities.Contact.filter({ id: contact_id });
    if (!contact || contact.length === 0) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }

    const contactData = contact[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (days_offset || 3));

    // Create follow-up task
    const task = await base44.asServiceRole.entities.Task.create({
      prospect_id: contactData.id,
      prospect_name: contactData.contact_name,
      company_name: contactData.company_name || '',
      task_type: task_type || 'Follow-up Email',
      title: `Follow up with ${contactData.contact_name}`,
      description: `Check in regarding their inquiry about ${contactData.services_interested?.join(', ') || 'services'}`,
      priority: priority || 'Medium',
      status: 'Pending',
      due_date: dueDate.toISOString(),
      automated: true
    });

    return Response.json({ 
      success: true, 
      task_id: task.id,
      due_date: dueDate.toISOString()
    });
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});