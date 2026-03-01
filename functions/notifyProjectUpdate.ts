import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate the request
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id, update_type, update_message, priority = 'normal' } = await req.json();

    if (!project_id || !update_type || !update_message) {
      return Response.json({ 
        error: 'Missing required fields: project_id, update_type, update_message' 
      }, { status: 400 });
    }

    // Fetch project details
    const projects = await base44.asServiceRole.entities.Project.filter({ id: project_id });
    if (projects.length === 0) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projects[0];
    
    // Notification titles based on update type
    const titles = {
      status_change: 'Project Status Updated',
      milestone_complete: 'Milestone Completed',
      document_added: 'New Document Available',
      message_received: 'New Message from Project Manager',
      approval_needed: 'Your Approval Required',
      schedule_change: 'Project Schedule Updated',
      budget_update: 'Budget Update',
      general: 'Project Update'
    };

    const title = titles[update_type] || titles.general;

    // Send notification via the notification function
    const notificationResponse = await base44.functions.invoke('sendNotification', {
      recipient_email: project.client_email,
      type: 'project_update',
      title: `${project.project_name}: ${title}`,
      message: update_message,
      link: `/ProjectDetail?id=${project_id}`,
      priority: priority,
      metadata: {
        project_id: project_id,
        project_name: project.project_name,
        update_type: update_type
      },
      send_email: true
    });

    // Notify assigned team members as well
    if (project.assigned_team_members && project.assigned_team_members.length > 0) {
      for (const teamEmail of project.assigned_team_members) {
        try {
          await base44.functions.invoke('sendNotification', {
            recipient_email: teamEmail,
            type: 'project_update',
            title: `Team Update: ${project.project_name}`,
            message: `A project update was sent to the client: ${update_message}`,
            link: `/ProjectDetail?id=${project_id}`,
            priority: 'normal',
            metadata: {
              project_id: project_id,
              project_name: project.project_name,
              update_type: update_type
            },
            send_email: false // Only send email to client
          });
        } catch (error) {
          console.error(`Failed to notify team member ${teamEmail}:`, error);
        }
      }
    }

    return Response.json({ 
      success: true,
      message: 'Project update notification sent successfully'
    });

  } catch (error) {
    console.error('Project notification error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send project notification' 
    }, { status: 500 });
  }
});