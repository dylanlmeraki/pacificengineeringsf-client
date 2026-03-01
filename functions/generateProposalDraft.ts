import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      project_request_id,
      service_type,
      client_name,
      project_details,
      budget_range,
      timeline
    } = await req.json();

    if (!service_type || !client_name) {
      return Response.json({ 
        error: 'Missing required fields: service_type, client_name' 
      }, { status: 400 });
    }

    // If project_request_id is provided, fetch details
    let requestDetails = null;
    if (project_request_id) {
      try {
        const requests = await base44.asServiceRole.entities.ProjectRequest.filter({ 
          id: project_request_id 
        });
        if (requests.length > 0) {
          requestDetails = requests[0];
        }
      } catch (e) {
        console.log('Could not fetch project request');
      }
    }

    // Generate proposal draft with AI
    const draft = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a professional proposal writer for Pacific Engineering & Construction Inc.

Generate a comprehensive proposal draft:

Client: ${client_name}
Service Type: ${service_type}
${project_details ? `Project Details: ${project_details}` : ''}
${budget_range ? `Budget Range: ${budget_range}` : ''}
${timeline ? `Timeline: ${timeline}` : ''}
${requestDetails ? `
Additional Context:
- Request Title: ${requestDetails.request_title}
- Description: ${requestDetails.description}
- Location: ${requestDetails.location || 'N/A'}
` : ''}

Create a professional proposal including:
1. Executive Summary
2. Scope of Work (detailed)
3. Project Approach & Methodology
4. Deliverables
5. Timeline & Milestones
6. Team & Qualifications
7. Pricing Structure (ranges/estimates)
8. Terms & Conditions

Make it professional, detailed, and compelling. Use Pacific Engineering's 40+ years of experience and 2000+ completed projects as selling points.

Return as JSON with structured sections.`,
      response_json_schema: {
        type: "object",
        properties: {
          proposal_title: { type: "string" },
          executive_summary: { type: "string" },
          scope_of_work: {
            type: "array",
            items: { type: "string" }
          },
          methodology: { type: "string" },
          deliverables: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          timeline: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase: { type: "string" },
                duration: { type: "string" }
              }
            }
          },
          team_composition: {
            type: "array",
            items: { type: "string" }
          },
          pricing_structure: { type: "string" },
          terms_and_conditions: {
            type: "array",
            items: { type: "string" }
          },
          next_steps: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({ 
      success: true,
      draft: draft,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Proposal generation error:', error);
    return Response.json({ 
      error: 'Generation failed',
      details: error.message,
      fallback: {
        proposal_title: "Professional Services Proposal",
        executive_summary: "This proposal outlines Pacific Engineering's approach to delivering high-quality services. With 40+ years of experience and 2000+ completed projects, we bring proven expertise to your project.",
        scope_of_work: [
          "Detailed scope requires manual development",
          "Please consult with project team"
        ],
        methodology: "Standard engineering best practices and proven project management approaches",
        deliverables: [
          { item: "Project Plan", description: "Comprehensive project execution plan" },
          { item: "Technical Documentation", description: "All required documentation and reports" }
        ],
        timeline: [
          { phase: "Initial Assessment", duration: "1-2 weeks" },
          { phase: "Project Execution", duration: "To be determined" },
          { phase: "Final Delivery", duration: "1 week" }
        ],
        team_composition: ["Project Manager", "Lead Engineer", "Support Staff"],
        pricing_structure: "Pricing to be determined based on detailed scope review",
        terms_and_conditions: [
          "Standard industry terms apply",
          "Detailed terms to be finalized in contract"
        ],
        next_steps: [
          "Schedule detailed consultation",
          "Refine scope and requirements",
          "Finalize pricing and timeline"
        ]
      }
    }, { status: 200 });
  }
});