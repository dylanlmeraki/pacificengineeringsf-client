import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_email, project_id } = await req.json();

    if (!client_email && !project_id) {
      return Response.json({ error: 'Missing client_email or project_id' }, { status: 400 });
    }

    // Gather client data
    let clientProjects = [];
    let targetEmail = client_email;

    if (project_id) {
      const projects = await base44.asServiceRole.entities.Project.filter({ id: project_id });
      if (projects.length > 0) {
        targetEmail = projects[0].client_email;
      }
    }

    if (targetEmail) {
      clientProjects = await base44.asServiceRole.entities.Project.filter({ 
        client_email: targetEmail 
      });
    }

    if (clientProjects.length === 0) {
      return Response.json({ 
        opportunities: [],
        message: 'No project history available for analysis'
      });
    }

    // Get all documents for context
    let allDocs = [];
    for (const proj of clientProjects) {
      try {
        const docs = await base44.asServiceRole.entities.ProjectDocument.filter({ 
          project_id: proj.id 
        });
        allDocs = allDocs.concat(docs);
      } catch (e) {
        console.log('No documents for project:', proj.id);
      }
    }

    // Analyze with AI
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a strategic sales advisor for Pacific Engineering & Construction Inc.

Analyze this client's project history to identify cross-selling and up-selling opportunities:

Client Project History:
${clientProjects.map(p => `
- Project: ${p.project_name}
- Type: ${p.project_type}
- Status: ${p.status}
- Started: ${p.start_date || 'N/A'}
${p.description ? `- Description: ${p.description}` : ''}
`).join('\n')}

Total Projects: ${clientProjects.length}
Total Documents: ${allDocs.length}

Our Services:
1. SWPPP & Stormwater Planning
2. Construction (Class A & B)
3. Inspections & Testing
4. Engineering Consulting (Civil & Structural)
5. Special Inspections

Identify:
1. Services they've used vs. services they haven't tried
2. Natural progression opportunities (e.g., after planning comes construction)
3. Complementary services they might need
4. Industry trends that create new needs
5. Specific, actionable opportunities with reasoning

Return as JSON with prioritized opportunities.`,
      response_json_schema: {
        type: "object",
        properties: {
          services_used: {
            type: "array",
            items: { type: "string" }
          },
          services_not_used: {
            type: "array",
            items: { type: "string" }
          },
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                opportunity_type: { type: "string" },
                service: { type: "string" },
                priority: { type: "string" },
                reasoning: { type: "string" },
                suggested_action: { type: "string" },
                estimated_value: { type: "string" }
              }
            }
          },
          engagement_strategy: { type: "string" },
          next_best_action: { type: "string" }
        }
      }
    });

    return Response.json({ 
      success: true,
      analysis: analysis,
      client_email: targetEmail,
      projects_analyzed: clientProjects.length
    });

  } catch (error) {
    console.error('Sales opportunity identification error:', error);
    return Response.json({ 
      error: 'Analysis failed',
      details: error.message,
      fallback: {
        services_used: ["Unknown"],
        services_not_used: ["Requires manual review"],
        opportunities: [{
          opportunity_type: "Manual Review Required",
          service: "Consultation",
          priority: "medium",
          reasoning: "Automated analysis unavailable",
          suggested_action: "Schedule strategic review call",
          estimated_value: "TBD"
        }],
        engagement_strategy: "Personal follow-up recommended",
        next_best_action: "Review client history manually and schedule call"
      }
    }, { status: 200 });
  }
});