import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formData, formType } = await req.json();

    // Build detailed context for AI
    const serviceDescriptions = {
      'swppp': 'SWPPP (Stormwater Pollution Prevention Plan) development and implementation - includes plan creation, QSD/QSP services, BMP design, monitoring, and full regulatory compliance support',
      'construction': 'Construction services - Class A and Class B contracting for infrastructure, commercial, and residential projects including grading, utilities, roadways, and building construction',
      'inspections-testing': 'Inspections & Testing - comprehensive field and laboratory testing including stormwater sampling, materials testing, concrete testing, geotechnical analysis, and structural inspections',
      'special-inspections': 'Special Inspections - certified inspections for structural steel, concrete, masonry, wood framing, soils, and fire-resistance rated assemblies per building codes',
      'structural-engineering': 'Structural Engineering - design, analysis, and consulting for new buildings, seismic retrofits, foundation engineering, structural assessments, and code compliance',
      'multiple': 'Multiple integrated services - comprehensive project support combining engineering, construction, and compliance services'
    };

    const projectTypeDetails = {
      'commercial': 'Commercial development projects requiring enhanced coordination with building departments and utility agencies',
      'residential': 'Residential construction with focus on code compliance and efficient permitting processes',
      'infrastructure': 'Infrastructure projects including roadways, utilities, and public works with extensive regulatory coordination',
      'industrial': 'Industrial facilities requiring specialized structural and environmental compliance solutions',
      'municipal': 'Municipal and government projects with strict compliance and documentation requirements',
      'mixed-use': 'Mixed-use developments combining residential, commercial, and potentially industrial components'
    };

    // Extract project details
    const projectLocations = formData.addresses || formData.locations || [];
    const serviceInterest = formData.serviceInterest;
    const projectType = formData.projectType;
    const additionalDetails = formData.message || formData.additionalDetails || '';
    const contactName = formData.name || formData.contact_name;
    const company = formData.company || formData.company_name || '';
    
    const locationsSummary = projectLocations
      .filter(loc => loc.addressLine || loc.county)
      .map((loc, i) => `Location ${i + 1}: ${loc.addressLine || 'Address TBD'}, ${loc.county || ''} County, CA - Approximate size: ${loc.approximateSize || 'TBD'}`)
      .join('\n');

    const prompt = `You are a proposal specialist for Pacific Engineering & Construction Inc., a full-service civil and structural engineering firm with construction capabilities.

CLIENT INFORMATION:
Name: ${contactName}
Company: ${company || 'Individual/Not provided'}

PROJECT DETAILS:
Primary Service Interest: ${serviceDescriptions[serviceInterest] || serviceInterest}
Project Type: ${projectTypeDetails[projectType] || projectType || 'To be determined'}
Project Locations:
${locationsSummary || 'Location details to be confirmed during consultation'}

Additional Context:
${additionalDetails || 'No additional details provided'}

YOUR TASK:
Generate a professional, detailed service proposal that includes:

1. **Executive Summary** (2-3 paragraphs)
   - Brief overview of the client's needs
   - Why Pacific Engineering is well-suited for this project
   - High-level scope and approach

2. **Proposed Services** (detailed breakdown)
   - Primary services based on their interest
   - Recommended complementary services that would benefit the project
   - Specific deliverables for each service

3. **Project Approach & Methodology** (3-4 paragraphs)
   - How Pacific Engineering will execute the work
   - Key phases and milestones
   - Quality assurance and compliance measures
   - Client collaboration touchpoints

4. **Estimated Timeline** (realistic phases)
   - Initial consultation and site assessment: X weeks
   - Design/planning phase: X weeks
   - Implementation/construction phase: X weeks/months
   - Final inspections and closeout: X weeks
   - Note any dependencies on permits or approvals

5. **Qualifications & Why Choose Us** (brief)
   - Licensed PE in California
   - Decades of Bay Area experience
   - Vertically integrated (engineering + construction)
   - Track record of on-time, compliant project delivery

6. **Next Steps**
   - Schedule detailed site visit
   - Finalize scope and specifications
   - Provide detailed cost estimate
   - Execute agreement and begin work

IMPORTANT GUIDELINES:
- Be specific but acknowledge that final scope will be refined during consultation
- Use professional but approachable language
- Emphasize compliance, efficiency, and quality
- Keep timeline estimates realistic - if uncertain, provide ranges
- For pricing, note "detailed cost estimate to be provided following site assessment"
- Reference Bay Area regulatory expertise where relevant
- Mention integration of services (e.g., engineering + construction) as a competitive advantage

Format the proposal as structured HTML with clear section headers (h2, h3), paragraphs, and bullet points where appropriate. Make it ready for direct presentation to the client.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
    });

    const proposalHtml = typeof response === 'string' ? response : response.content || response.text;

    // Generate proposal number
    const proposalNumber = `PROP-${Date.now().toString().slice(-8)}`;

    return Response.json({
      success: true,
      proposal: {
        title: `${serviceDescriptions[serviceInterest]?.split(' - ')[0] || 'Service Proposal'} - ${contactName}`,
        content_html: proposalHtml,
        proposal_number: proposalNumber,
        service_interest: serviceInterest,
        project_type: projectType,
        client_name: contactName,
        client_company: company,
        locations_summary: locationsSummary,
        form_data: formData
      }
    });

  } catch (error) {
    console.error('Error generating proposal:', error);
    return Response.json({ 
      error: 'Failed to generate proposal',
      details: error.message 
    }, { status: 500 });
  }
});