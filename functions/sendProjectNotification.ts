import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, notificationType, templateId, customMessage } = await req.json();

    if (!projectId || !notificationType) {
      return Response.json({ 
        error: 'Missing required fields: projectId, notificationType' 
      }, { status: 400 });
    }

    // Fetch project and client details
    const project = await base44.asServiceRole.entities.Project.get(projectId);
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get client email
    const clientEmail = project.client_email;
    if (!clientEmail) {
      return Response.json({ error: 'No client email found for project' }, { status: 400 });
    }

    let subject = '';
    let body = '';

    // If template provided, use it
    if (templateId) {
      try {
        const template = await base44.asServiceRole.entities.CommunicationTemplate.get(templateId);
        
        const variables = {
          project_name: project.project_name,
          client_name: project.client_name,
          company_name: project.client_company || project.client_name,
          project_number: project.project_number,
          status: project.status,
          date: new Date().toLocaleDateString(),
          progress: project.progress_percentage || 0
        };

        subject = template.subject_template;
        body = template.body_template;

        Object.keys(variables).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          subject = subject.replace(regex, variables[key]);
          body = body.replace(regex, variables[key]);
        });
      } catch (error) {
        console.error('Error loading template:', error);
        return Response.json({ error: 'Template not found' }, { status: 404 });
      }
    } else {
      // Default notification
      subject = `Project Update: ${project.project_name}`;
      body = customMessage || `
        <h2>Project Update</h2>
        <p>Hi ${project.client_name},</p>
        <p>There's an update on your project: <strong>${project.project_name}</strong></p>
        <p>Status: ${project.status}</p>
        <p>Progress: ${project.progress_percentage || 0}%</p>
      `;
    }

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: clientEmail,
      from_name: 'Pacific Engineering',
      subject,
      body
    });

    // Create notification record
    await base44.asServiceRole.entities.Notification.create({
      user_email: clientEmail,
      type: notificationType,
      title: subject,
      message: body,
      related_project_id: projectId,
      read: false
    });

    // Log activity
    await base44.asServiceRole.entities.AuditLog.create({
      actor_email: user.email,
      actor_name: user.full_name,
      action: 'email_sent',
      resource_type: 'Project',
      resource_id: projectId,
      resource_name: project.project_name,
      details: `Sent ${notificationType} notification to ${clientEmail}`
    });

    return Response.json({
      success: true,
      message: 'Notification sent successfully',
      recipient: clientEmail
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return Response.json({ 
      error: error.message || 'Failed to send notification',
      details: error.stack
    }, { status: 500 });
  }
});