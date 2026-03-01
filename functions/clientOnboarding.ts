import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const payload = await req.json();
    const { event, data } = payload;

    // This function is triggered by entity automation on Project create
    const projectData = data;
    if (!projectData) {
      return Response.json({ error: 'No project data provided' }, { status: 400 });
    }

    const projectId = event?.entity_id || projectData.id;
    const clientEmail = projectData.client_email;
    const clientName = projectData.client_name || clientEmail;
    const projectName = projectData.project_name || 'New Project';
    const projectType = projectData.project_type || 'General';

    const logActions = [];

    // Step 1: Send welcome email
    if (clientEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: clientEmail,
        subject: `Welcome to Pacific Engineering - ${projectName}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Welcome to Pacific Engineering!</h2>
            <p>Dear ${clientName},</p>
            <p>Thank you for choosing Pacific Engineering for your <strong>${projectType}</strong> project: <strong>${projectName}</strong>.</p>
            <p>Here's what happens next:</p>
            <ol>
              <li>Your project manager will reach out to schedule a kickoff meeting</li>
              <li>You'll receive a getting started guide with portal access instructions</li>
              <li>We'll begin the initial project planning and assessment</li>
            </ol>
            <p>You can access your project dashboard anytime at <a href="https://portal.pacificengineeringsf.com">portal.pacificengineeringsf.com</a></p>
            <p>If you have any questions, don't hesitate to reach out.</p>
            <br/>
            <p>Best regards,<br/>The Pacific Engineering Team</p>
          </div>
        `
      });
      logActions.push({ action_type: 'send_email', target: clientEmail, result: 'success' });
    }

    // Step 2: Create tasks for the project manager
    const tasks = [
      {
        title: `Schedule kickoff meeting - ${projectName}`,
        task_type: 'Schedule Meeting',
        priority: 'High',
        due_days: 2
      },
      {
        title: `Send getting started guide - ${clientName}`,
        task_type: 'Follow-up Email',
        priority: 'Medium',
        due_days: 1
      },
      {
        title: `Complete initial project assessment - ${projectName}`,
        task_type: 'Research',
        priority: 'High',
        due_days: 5
      },
      {
        title: `Set up project milestones - ${projectName}`,
        task_type: 'Other',
        priority: 'Medium',
        due_days: 7
      }
    ];

    for (const task of tasks) {
      await base44.asServiceRole.entities.Task.create({
        title: task.title,
        task_type: task.task_type,
        priority: task.priority,
        status: 'Pending',
        due_date: new Date(Date.now() + task.due_days * 86400000).toISOString(),
        automated: true,
        company_name: projectName,
        prospect_name: clientName
      });
      logActions.push({ action_type: 'create_task', target: task.title, result: 'success' });
    }

    // Step 3: Create initial milestones
    const milestones = [
      { name: 'Project Kickoff', days: 7 },
      { name: 'Initial Assessment Complete', days: 14 },
      { name: 'Plan Delivery', days: 30 }
    ];

    for (const ms of milestones) {
      await base44.asServiceRole.entities.ProjectMilestone.create({
        project_id: projectId,
        milestone_name: ms.name,
        status: 'In Progress',
        due_date: new Date(Date.now() + ms.days * 86400000).toISOString().split('T')[0]
      });
      logActions.push({ action_type: 'create_milestone', target: ms.name, result: 'success' });
    }

    // Step 4: Notify admin team
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    for (const admin of admins) {
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: admin.email,
        type: 'new_client_onboarding',
        title: 'New Client Onboarded',
        message: `New project "${projectName}" created for ${clientName}. Kickoff tasks have been auto-created.`,
        priority: 'high',
        read: false,
        metadata: { project_id: projectId }
      });
    }
    logActions.push({ action_type: 'send_notification', target: 'admin_team', result: 'success' });

    // Step 5: Log onboarding to AutomationLog
    await base44.asServiceRole.entities.AutomationLog.create({
      rule_id: 'client_onboarding',
      rule_name: 'New Client Onboarding',
      trigger_event: 'project_created',
      entity_type: 'Project',
      entity_id: projectId,
      execution_status: 'success',
      actions_taken: logActions,
      execution_duration_ms: 0
    });

    return Response.json({
      success: true,
      message: `Onboarding completed for ${clientName}`,
      actions_count: logActions.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});