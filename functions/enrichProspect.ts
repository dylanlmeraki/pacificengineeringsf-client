import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prospectId, prospectData } = await req.json();

    if (!prospectId && !prospectData) {
      return Response.json({ 
        error: 'Either prospectId or prospectData is required' 
      }, { status: 400 });
    }

    // Get prospect data
    let prospect = prospectData;
    if (prospectId && !prospectData) {
      const prospects = await base44.asServiceRole.entities.Prospect.filter({ id: prospectId });
      prospect = prospects[0];
      if (!prospect) {
        return Response.json({ error: 'Prospect not found' }, { status: 404 });
      }
    }

    // Build enrichment prompt
    const enrichmentPrompt = `You are a professional data enrichment specialist. Find accurate, up-to-date information about this prospect:

Company: ${prospect.company_name}
Contact: ${prospect.contact_name}
Title: ${prospect.contact_title || 'Not specified'}
Current LinkedIn: ${prospect.linkedin_url || 'Not found'}
Current Website: ${prospect.company_website || 'Not found'}
Location: ${prospect.company_location || 'Not specified'}

Search the web and find:
1. LinkedIn profile URL for ${prospect.contact_name} at ${prospect.company_name}
2. Company website for ${prospect.company_name}
3. Company phone number (if available)
4. Company address (if not already known)
5. Annual revenue estimate (if available)
6. Company size estimate (number of employees)
7. Key business functions or services they provide
8. Any recent news or projects (last 6 months)

Return ONLY valid JSON in this exact format:
{
  "linkedin_url": "string or null",
  "company_website": "string or null",
  "company_phone": "string or null",
  "company_address": "string or null",
  "annual_revenue": "string or null",
  "company_size": "string or null",
  "key_functions": "string or null",
  "recent_activity": "string or null",
  "enriched": true,
  "confidence": "high/medium/low"
}`;

    const enrichmentResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: enrichmentPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          linkedin_url: { type: "string" },
          company_website: { type: "string" },
          company_phone: { type: "string" },
          company_address: { type: "string" },
          annual_revenue: { type: "string" },
          company_size: { type: "string" },
          key_functions: { type: "string" },
          recent_activity: { type: "string" },
          enriched: { type: "boolean" },
          confidence: { type: "string" }
        }
      }
    });

    // Parse response
    let enrichedData;
    try {
      enrichedData = typeof enrichmentResponse === 'string' 
        ? JSON.parse(enrichmentResponse) 
        : enrichmentResponse;
    } catch (parseError) {
      console.error('Failed to parse enrichment response:', parseError);
      return Response.json({ 
        error: 'Failed to parse enrichment data',
        success: false 
      }, { status: 500 });
    }

    // Prepare update data (only update fields that were found and are not already filled)
    const updateData = {};
    
    if (enrichedData.linkedin_url && !prospect.linkedin_url) {
      updateData.linkedin_url = enrichedData.linkedin_url;
    }
    if (enrichedData.company_website && !prospect.company_website) {
      updateData.company_website = enrichedData.company_website;
    }
    if (enrichedData.company_phone && !prospect.contact_phone) {
      updateData.contact_phone = enrichedData.company_phone;
    }
    if (enrichedData.company_address && !prospect.company_address) {
      updateData.company_address = enrichedData.company_address;
    }
    if (enrichedData.annual_revenue && !prospect.annual_revenue) {
      updateData.annual_revenue = enrichedData.annual_revenue;
    }
    if (enrichedData.company_size && !prospect.company_size) {
      updateData.company_size = enrichedData.company_size;
    }
    if (enrichedData.key_functions && !prospect.key_functions) {
      updateData.key_functions = enrichedData.key_functions;
    }

    // Add enrichment metadata to notes
    if (enrichedData.recent_activity) {
      const enrichmentNote = `\n\n[Auto-enriched ${new Date().toISOString().split('T')[0]}]\n${enrichedData.recent_activity}`;
      updateData.notes = (prospect.notes || '') + enrichmentNote;
    }

    // Update prospect if we have new data
    if (prospectId && Object.keys(updateData).length > 0) {
      await base44.asServiceRole.entities.Prospect.update(prospectId, updateData);
    }

    return Response.json({
      success: true,
      enrichedData: enrichedData,
      updatedFields: Object.keys(updateData),
      confidence: enrichedData.confidence || 'medium'
    });

  } catch (error) {
    console.error('Enrichment error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});