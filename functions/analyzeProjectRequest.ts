import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { request_id } = await req.json();

    if (!request_id) {
      return Response.json({ error: 'Missing request_id' }, { status: 400 });
    }

    // Fetch request details
    const requests = await base44.asServiceRole.entities.ProjectRequest.filter({ id: request_id });
    if (requests.length === 0) {
      return Response.json({ error: 'Project request not found' }, { status: 404 });
    }

    const projectRequest = requests[0];

    // Get client's project history if exists
    let clientHistory = [];
    try {
      clientHistory = await base44.asServiceRole.entities.Project.filter({ 
        client_email: projectRequest.client_email 
      });
    } catch (e) {
      console.log('No previous projects found');
    }

    // Analyze with AI
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a professional sales assistant for Pacific Engineering & Construction Inc.

Analyze this project request and provide detailed sales intelligence:

Request Details:
- Title: ${projectRequest.request_title}
- Type: ${projectRequest.project_type}
- Description: ${projectRequest.description}
- Location: ${projectRequest.location || 'Not specified'}
- Budget: ${projectRequest.budget_range || 'Not specified'}
- Timeline: ${projectRequest.desired_timeline || 'Not specified'}
- Client: ${projectRequest.client_name} (${projectRequest.client_email})

${clientHistory.length > 0 ? `Previous Projects: ${clientHistory.length} completed/ongoing projects` : 'New client'}

Provide:
1. Project complexity assessment (simple/moderate/complex)
2. Estimated project value range
3. Recommended team composition
4. Potential challenges and risks
5. Cross-selling opportunities (other services they might need)
6. Personalized response email (professional, enthusiastic, max 250 words)
7. Proposed project timeline milestones
8. Suggested next actions for sales team

Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          complexity: { type: "string" },
          estimated_value_range: { type: "string" },
          recommended_team: {
            type: "array",
            items: { type: "string" }
          },
          challenges: {
            type: "array",
            items: { type: "string" }
          },
          cross_sell_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          response_email: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" }
            }
          },
          proposed_milestones: {
            type: "array",
            items: { type: "string" }
          },
          next_actions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Update request with AI insights
    await base44.asServiceRole.entities.ProjectRequest.update(request_id, {
      ai_analysis: analysis,
      last_analyzed: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      analysis: analysis,
      request: projectRequest,
      client_history_count: clientHistory.length
    });

  } catch (error) {
    console.error('Project request analysis error:', error);
    return Response.json({ 
      error: 'Analysis failed',
      details: error.message,
      fallback: {
        complexity: "moderate",
        estimated_value_range: "Requires detailed review",
        recommended_team: ["Project Manager", "Engineer"],
        challenges: ["Requires manual assessment"],
        cross_sell_opportunities: [],
        response_email: {
          subject: "Your Project Request - Pacific Engineering",
          body: "Thank you for submitting your project request. Our team is reviewing the details and will contact you within 24 hours to discuss next steps."
        },
        proposed_milestones: ["Initial consultation", "Proposal delivery", "Project kickoff"],
        next_actions: ["Schedule consultation call", "Prepare detailed proposal"]
      }
    }, { status: 200 });
  }
});