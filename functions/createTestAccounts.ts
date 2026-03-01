import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const results = {
      testData: [],
      errors: []
    };

    // Create test communication templates
    try {
      const template1 = await base44.asServiceRole.entities.CommunicationTemplate.create({
        template_name: "Milestone Completion Notice",
        template_type: "milestone_complete",
        subject_template: "Milestone Complete: {{milestone_name}} - {{project_name}}",
        body_template: `
          <h2>Milestone Completed</h2>
          <p>Hi {{client_name}},</p>
          <p>Great news! We've completed the milestone "<strong>{{milestone_name}}</strong>" for your project {{project_name}}.</p>
          <p>Current progress: {{progress}}%</p>
          <p>Next steps will be communicated shortly.</p>
          <p>Best regards,<br>Pacific Engineering Team</p>
        `,
        trigger_event: "milestone_completed",
        active: true,
        variables: ["milestone_name", "project_name", "client_name", "progress"]
      });
      results.testData.push({ type: 'template', id: template1.id, name: template1.template_name });

      const template2 = await base44.asServiceRole.entities.CommunicationTemplate.create({
        template_name: "Deadline Reminder - 3 Days",
        template_type: "deadline_reminder",
        subject_template: "Reminder: {{project_name}} - Due {{deadline}}",
        body_template: `
          <h2>Deadline Reminder</h2>
          <p>Hi {{client_name}},</p>
          <p>This is a reminder that your project "<strong>{{project_name}}</strong>" is due on {{deadline}}.</p>
          <p>Please ensure all required actions are completed.</p>
          <p>If you have questions, please contact us.</p>
          <p>Best regards,<br>Pacific Engineering Team</p>
        `,
        trigger_event: "deadline_approaching",
        trigger_days_before: 3,
        active: true,
        variables: ["project_name", "client_name", "deadline"]
      });
      results.testData.push({ type: 'template', id: template2.id, name: template2.template_name });

    } catch (error) {
      results.errors.push({ item: 'templates', error: error.message });
    }

    // Create test project for demo purposes
    try {
      const testProject = await base44.asServiceRole.entities.Project.create({
        project_name: "Test Construction Project - Demo",
        project_number: "TEST-2024-001",
        client_email: "testclient@example.com",
        client_name: "Test Client",
        project_type: "Construction",
        status: "In Progress",
        priority: "Medium",
        start_date: new Date().toISOString().split('T')[0],
        estimated_completion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: "San Francisco, CA",
        description: "Test project for demo and testing purposes",
        progress_percentage: 45
      });
      results.testData.push({ type: 'project', id: testProject.id, name: testProject.project_name });

      // Create test milestone
      const testMilestone = await base44.asServiceRole.entities.ProjectMilestone.create({
        project_id: testProject.id,
        milestone_name: "Foundation Review",
        description: "Review and approve foundation work",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 15000,
        status: "In Progress"
      });
      results.testData.push({ type: 'milestone', id: testMilestone.id, name: testMilestone.milestone_name });

      // Schedule test notification
      const testNotification = await base44.asServiceRole.entities.ScheduledNotification.create({
        notification_type: "deadline_reminder",
        recipient_email: "testclient@example.com",
        recipient_name: "Test Client",
        project_id: testProject.id,
        project_name: testProject.project_name,
        scheduled_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        custom_message: "This is a test notification to verify the automation system."
      });
      results.testData.push({ type: 'notification', id: testNotification.id, scheduled: testNotification.scheduled_date });

    } catch (error) {
      results.errors.push({ item: 'test project data', error: error.message });
    }

    // Log test data creation
    await base44.asServiceRole.entities.AuditLog.create({
      actor_email: user.email,
      actor_name: user.full_name,
      action: "other",
      resource_type: "System",
      resource_name: "Test Accounts",
      details: `Created ${results.testData.length} test items for system validation`
    });

    return Response.json({
      success: true,
      message: `Created ${results.testData.length} test items`,
      testData: results.testData,
      errors: results.errors.length > 0 ? results.errors : undefined,
      instructions: {
        templates: "Check the Communications page to view and test templates",
        automation: "Check the Automation Dashboard to see scheduled notifications",
        project: "Check the Projects Manager to view the test project",
        cleanup: "Delete test data after validation is complete"
      }
    });

  } catch (error) {
    console.error('Error creating test accounts:', error);
    return Response.json({ 
      error: error.message || 'Failed to create test accounts',
      details: error.stack
    }, { status: 500 });
  }
});