import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all projects with upcoming deadlines
    const projects = await base44.asServiceRole.entities.Project.list('-created_date', 500);
    const milestones = await base44.asServiceRole.entities.ProjectMilestone.list('-due_date', 500);
    
    const scheduledCount = 0;
    const errors = [];

    // Check for milestones due in 3 days
    for (const milestone of milestones) {
      try {
        if (milestone.status === 'Completed') continue;

        const dueDate = new Date(milestone.due_date);
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        if (dueDate > new Date() && dueDate <= threeDaysFromNow) {
          // Find the project
          const project = projects.find(p => p.id === milestone.project_id);
          if (!project || !project.client_email) continue;

          // Check if notification already scheduled
          const existing = await base44.asServiceRole.entities.ScheduledNotification.filter({
            project_id: project.id,
            notification_type: 'milestone_due',
            sent: false
          });

          if (existing.length === 0) {
            await base44.asServiceRole.entities.ScheduledNotification.create({
              notification_type: 'milestone_due',
              recipient_email: project.client_email,
              recipient_name: project.client_name,
              project_id: project.id,
              project_name: project.project_name,
              scheduled_date: new Date(dueDate.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day before
              custom_message: `
                <h2>Milestone Reminder</h2>
                <p>Hi ${project.client_name},</p>
                <p>This is a reminder that milestone "<strong>${milestone.milestone_name}</strong>" for project ${project.project_name} is due on ${dueDate.toLocaleDateString()}.</p>
                <p>Please review any pending approvals or actions needed.</p>
              `
            });
            scheduledCount++;
          }
        }
      } catch (error) {
        console.error(`Error scheduling milestone notification:`, error);
        errors.push({ milestone: milestone.milestone_name, error: error.message });
      }
    }

    // Check for projects with estimated completion dates approaching
    for (const project of projects) {
      try {
        if (project.status === 'Completed' || project.status === 'Closed') continue;
        if (!project.estimated_completion || !project.client_email) continue;

        const completionDate = new Date(project.estimated_completion);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        if (completionDate > new Date() && completionDate <= sevenDaysFromNow) {
          const existing = await base44.asServiceRole.entities.ScheduledNotification.filter({
            project_id: project.id,
            notification_type: 'deadline_reminder',
            sent: false
          });

          if (existing.length === 0) {
            await base44.asServiceRole.entities.ScheduledNotification.create({
              notification_type: 'deadline_reminder',
              recipient_email: project.client_email,
              recipient_name: project.client_name,
              project_id: project.id,
              project_name: project.project_name,
              scheduled_date: new Date(completionDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days before
              custom_message: `
                <h2>Project Deadline Approaching</h2>
                <p>Hi ${project.client_name},</p>
                <p>Your project "<strong>${project.project_name}</strong>" is scheduled for completion on ${completionDate.toLocaleDateString()}.</p>
                <p>Current progress: ${project.progress_percentage || 0}%</p>
                <p>Please ensure all necessary approvals and actions are completed.</p>
              `
            });
            scheduledCount++;
          }
        }
      } catch (error) {
        console.error(`Error scheduling project notification:`, error);
        errors.push({ project: project.project_name, error: error.message });
      }
    }

    return Response.json({
      success: true,
      scheduledCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Scheduled ${scheduledCount} new notification(s)`
    });

  } catch (error) {
    console.error('Error scheduling notifications:', error);
    return Response.json({ 
      error: error.message || 'Failed to schedule notifications',
      details: error.stack
    }, { status: 500 });
  }
});