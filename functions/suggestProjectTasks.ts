import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const project_id = body?.project_id || (body?.event?.entity_name === 'Project' ? body?.event?.entity_id : body?.data?.project_id);
    const doc_id = body?.doc_id || (body?.event?.entity_name === 'ProjectDoc' ? body?.event?.entity_id : body?.data?.id);
    const create = body?.create ?? false;

    let project = null; let doc = null;
    if (project_id) project = await base44.entities.Project.get(project_id);
    if (doc_id) doc = await base44.entities.ProjectDoc.get(doc_id);

    if (!project && !doc) {
      return Response.json({ error: 'Provide project_id or doc_id' }, { status: 400 });
    }

    const context = { project, doc };

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert construction project coordinator. Given JSON context of a project and/or a document, generate a concise list of suggested tasks to help kick off and manage the work. Use realistic task types, reasonable priorities, and suggested due windows. Output must follow the JSON schema exactly.\n\nCONTEXT JSON: ${JSON.stringify(context)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                task_type: { type: 'string' },
                priority: { type: 'string' },
                due_in_days: { type: 'number' },
                notes: { type: 'string' }
              },
              required: ['title']
            }
          }
        },
        required: ['suggestions']
      }
    });

    const suggestions = response?.suggestions || [];

    if (create && suggestions.length && project) {
      const payload = suggestions.map(s => ({
        project_id: project.id,
        project_name: project.project_name,
        task_type: s.task_type || 'Other',
        title: s.title,
        description: s.notes || '',
        priority: s.priority || 'Medium',
        status: 'Pending',
        automated: true
      }));
      await base44.entities.Task.bulkCreate(payload);
      return Response.json({ created: payload.length, suggestions });
    }

    return Response.json({ suggestions });
  } catch (error) {
    return Response.json({ error: error.message || 'Server error' }, { status: 500 });
  }
});