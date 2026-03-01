import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const startTime = Date.now();
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { trigger_type, entity_type, entity_id, data, old_data } = payload;

    if (!trigger_type) {
      return Response.json({ error: 'trigger_type is required' }, { status: 400 });
    }

    // Fetch all active workflows matching this trigger type
    const workflows = await base44.asServiceRole.entities.Workflow.filter({
      trigger_type: trigger_type,
      active: true
    });

    if (workflows.length === 0) {
      return Response.json({ message: 'No matching workflows found', executed: 0 });
    }

    const results = [];

    for (const workflow of workflows) {
      const logEntry = {
        rule_id: workflow.id,
        rule_name: workflow.name,
        trigger_event: trigger_type,
        entity_type: entity_type || 'Unknown',
        entity_id: entity_id || '',
        execution_status: 'success',
        actions_taken: [],
        execution_duration_ms: 0
      };

      try {
        // Evaluate trigger conditions
        const matches = evaluateTriggerConditions(workflow.trigger_config, data, old_data);
        if (!matches) {
          logEntry.execution_status = 'skipped';
          logEntry.error_details = 'Trigger conditions not met';
          await base44.asServiceRole.entities.AutomationLog.create(logEntry);
          results.push({ workflow: workflow.name, status: 'skipped' });
          continue;
        }

        // Execute each step
        for (const step of workflow.steps || []) {
          const actionResult = await executeAction(base44, step, {
            entity_type,
            entity_id,
            data,
            old_data,
            workflow
          });

          logEntry.actions_taken.push({
            action_type: step.action_type,
            target: actionResult.target || '',
            result: actionResult.success ? 'success' : 'failed',
            error: actionResult.error || ''
          });

          if (!actionResult.success) {
            logEntry.execution_status = 'partial_success';
          }
        }

        // Update workflow execution count
        await base44.asServiceRole.entities.Workflow.update(workflow.id, {
          execution_count: (workflow.execution_count || 0) + 1,
          last_executed: new Date().toISOString()
        });

        results.push({ workflow: workflow.name, status: logEntry.execution_status });

      } catch (err) {
        logEntry.execution_status = 'failed';
        logEntry.error_details = err.message;
        results.push({ workflow: workflow.name, status: 'failed', error: err.message });
      }

      logEntry.execution_duration_ms = Date.now() - startTime;
      await base44.asServiceRole.entities.AutomationLog.create(logEntry);
    }

    return Response.json({ executed: results.length, results });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function evaluateTriggerConditions(config, data, oldData) {
  if (!config || Object.keys(config).length === 0) return true;

  // Status change triggers
  if (config.to_status && data?.status) {
    if (data.status !== config.to_status) return false;
    if (config.from_status && oldData?.status !== config.from_status) return false;
  }

  // Score threshold triggers
  if (config.score_field && config.threshold) {
    const scoreValue = data?.[config.score_field] || 0;
    if (scoreValue < config.threshold) return false;
  }

  // Project type filter
  if (config.project_type && data?.project_type) {
    if (data.project_type !== config.project_type) return false;
  }

  return true;
}

async function executeAction(base44, step, context) {
  const { action_type, action_config } = step;
  const { entity_type, entity_id, data, workflow } = context;

  try {
    switch (action_type) {
      case 'create_task': {
        const taskData = {
          title: interpolateTemplate(action_config.title || 'Auto-generated task', data),
          description: interpolateTemplate(action_config.description || '', data),
          task_type: action_config.task_type || 'Other',
          priority: action_config.priority || 'Medium',
          status: 'Pending',
          due_date: new Date(Date.now() + (action_config.due_days || 3) * 86400000).toISOString(),
          automated: true,
          prospect_id: data?.prospect_id || entity_id,
          prospect_name: data?.contact_name || data?.client_name || '',
          company_name: data?.company_name || data?.project_name || ''
        };
        if (action_config.assigned_to) taskData.assigned_to = action_config.assigned_to;
        await base44.asServiceRole.entities.Task.create(taskData);
        return { success: true, target: taskData.title };
      }

      case 'send_email': {
        const to = action_config.to || data?.client_email || data?.contact_email;
        if (!to) return { success: false, error: 'No recipient email' };
        
        await base44.asServiceRole.integrations.Core.SendEmail({
          to,
          subject: interpolateTemplate(action_config.subject || 'Notification from Pacific Engineering', data),
          body: interpolateTemplate(action_config.body || action_config.template || 'You have a new update.', data)
        });
        return { success: true, target: to };
      }

      case 'send_notification': {
        const recipients = action_config.recipients || [];
        const message = interpolateTemplate(action_config.message || 'Workflow notification', data);
        
        // If no specific recipients, notify admins
        if (recipients.length === 0) {
          const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
          for (const admin of admins) {
            await base44.asServiceRole.entities.Notification.create({
              recipient_email: admin.email,
              type: 'workflow_notification',
              title: `Workflow: ${workflow.name}`,
              message,
              priority: action_config.priority || 'normal',
              read: false
            });
          }
        } else {
          for (const email of recipients) {
            await base44.asServiceRole.entities.Notification.create({
              recipient_email: email,
              type: 'workflow_notification',
              title: `Workflow: ${workflow.name}`,
              message,
              priority: action_config.priority || 'normal',
              read: false
            });
          }
        }
        return { success: true, target: 'notifications sent' };
      }

      case 'update_project': {
        const projectId = data?.project_id || entity_id;
        if (!projectId) return { success: false, error: 'No project ID' };
        
        const updateData = {};
        if (action_config.status) updateData.status = action_config.status;
        if (action_config.progress_percentage !== undefined) updateData.progress_percentage = action_config.progress_percentage;
        if (action_config.notes) updateData.notes = interpolateTemplate(action_config.notes, data);
        
        await base44.asServiceRole.entities.Project.update(projectId, updateData);
        return { success: true, target: projectId };
      }

      case 'create_milestone': {
        const projectId = data?.project_id || entity_id;
        if (!projectId) return { success: false, error: 'No project ID' };
        
        await base44.asServiceRole.entities.ProjectMilestone.create({
          project_id: projectId,
          milestone_name: interpolateTemplate(action_config.milestone_name || 'New Milestone', data),
          description: interpolateTemplate(action_config.description || '', data),
          status: action_config.status || 'In Progress',
          due_date: action_config.due_date || new Date(Date.now() + (action_config.due_days || 14) * 86400000).toISOString().split('T')[0],
          amount: action_config.amount || 0
        });
        return { success: true, target: action_config.milestone_name || 'New Milestone' };
      }

      case 'send_client_update': {
        const clientEmail = data?.client_email;
        if (!clientEmail) return { success: false, error: 'No client email' };
        
        const subject = interpolateTemplate(action_config.subject || 'Project Update', data);
        const body = interpolateTemplate(action_config.body || 'Your project has been updated.', data);
        
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: clientEmail,
          subject,
          body
        });

        await base44.asServiceRole.entities.Notification.create({
          recipient_email: clientEmail,
          type: 'project_update',
          title: subject,
          message: body,
          priority: 'normal',
          read: false
        });
        return { success: true, target: clientEmail };
      }

      case 'generate_report': {
        const projectId = data?.project_id || entity_id;
        if (!projectId) return { success: false, error: 'No project ID for report' };
        
        await base44.asServiceRole.functions.invoke('generateProjectReport', {
          project_id: projectId,
          report_type: action_config.report_type || 'project_progress'
        });
        return { success: true, target: projectId };
      }

      case 'update_prospect': {
        const prospectId = data?.prospect_id || entity_id;
        if (!prospectId || !action_config.field) return { success: false, error: 'Missing prospect ID or field' };
        
        await base44.asServiceRole.entities.Prospect.update(prospectId, {
          [action_config.field]: action_config.value
        });
        return { success: true, target: prospectId };
      }

      case 'create_interaction': {
        await base44.asServiceRole.entities.Interaction.create({
          prospect_id: data?.prospect_id || entity_id,
          prospect_name: data?.contact_name || data?.client_name || '',
          company_name: data?.company_name || '',
          interaction_type: action_config.interaction_type || 'Note',
          interaction_date: new Date().toISOString(),
          subject: interpolateTemplate(action_config.subject || 'Automated interaction', data),
          content: interpolateTemplate(action_config.content || '', data),
          automated: true
        });
        return { success: true, target: 'interaction created' };
      }

      case 'assign_project_manager': {
        const projectId = data?.project_id || entity_id;
        if (!projectId) return { success: false, error: 'No project ID' };
        
        const pm = action_config.pm_email;
        if (!pm) return { success: false, error: 'No PM email specified' };
        
        const project = await base44.asServiceRole.entities.Project.filter({ id: projectId });
        if (project.length > 0) {
          const existing = project[0].assigned_team_members || [];
          if (!existing.includes(pm)) {
            await base44.asServiceRole.entities.Project.update(projectId, {
              assigned_team_members: [...existing, pm]
            });
          }
        }
        return { success: true, target: pm };
      }

      case 'wait_days': {
        // Wait steps are logged but not actually executed (would require a scheduler)
        return { success: true, target: `${action_config.days || 1} day wait` };
      }

      default:
        return { success: false, error: `Unknown action type: ${action_type}` };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function interpolateTemplate(template, data) {
  if (!template || !data) return template || '';
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}