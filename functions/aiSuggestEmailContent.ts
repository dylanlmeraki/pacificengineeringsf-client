import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { template_name, current_subject, current_body_html, prospect_attributes } = body || {};

    const prompt = `You are an expert B2B copywriter. Generate improved subject lines (short, high-signal, no spam) and a body variant using best practices.\n\nTemplate: ${template_name || 'Untitled'}\nCurrent Subject: ${current_subject || ''}\nCurrent Body (HTML allowed): ${current_body_html ? current_body_html.slice(0, 2500) : ''}\nProspect Attributes: ${prospect_attributes ? JSON.stringify(prospect_attributes) : '{}'}\n\nReturn concise suggestions ready to paste.`;

    const llm = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: 'object',
        properties: {
          subject_suggestions: { type: 'array', items: { type: 'string' } },
          body_suggestions: { type: 'array', items: { type: 'string' } }
        },
        required: ['subject_suggestions', 'body_suggestions']
      }
    });

    return Response.json({ suggestions: llm });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});