import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contact_id } = await req.json();

    if (!contact_id) {
      return Response.json({ error: 'Missing contact_id' }, { status: 400 });
    }

    // Fetch contact details
    const contacts = await base44.asServiceRole.entities.Contact.filter({ id: contact_id });
    if (contacts.length === 0) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }

    const contact = contacts[0];

    // Analyze with AI
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a professional sales assistant for Pacific Engineering & Construction Inc., a company that provides:
- Stormwater planning (SWPPP, QSD/QSP services)
- Construction services (Class A & B licenses)
- Inspections & testing
- Engineering consulting (civil & structural)

Analyze this contact inquiry and provide actionable sales intelligence:

Contact Information:
- Name: ${contact.name}
- Email: ${contact.email}
- Phone: ${contact.phone || 'Not provided'}
- Company: ${contact.company || 'Not provided'}
- Message: ${contact.message}
- Interest: ${contact.interest || 'General inquiry'}

Provide:
1. Quick sentiment analysis (positive/neutral/negative + confidence)
2. Urgency level (low/medium/high/urgent)
3. Recommended services to highlight
4. Key pain points identified
5. Personalized follow-up email (professional, engaging, max 200 words)
6. Suggested next steps for sales team

Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment: { 
            type: "object",
            properties: {
              type: { type: "string" },
              confidence: { type: "number" }
            }
          },
          urgency: { type: "string" },
          recommended_services: { 
            type: "array",
            items: { type: "string" }
          },
          pain_points: {
            type: "array",
            items: { type: "string" }
          },
          follow_up_email: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" }
            }
          },
          next_steps: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Update contact with AI insights
    await base44.asServiceRole.entities.Contact.update(contact_id, {
      ai_analysis: analysis,
      last_analyzed: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      analysis: analysis,
      contact: contact
    });

  } catch (error) {
    console.error('Contact analysis error:', error);
    return Response.json({ 
      error: 'Analysis failed',
      details: error.message,
      fallback: {
        sentiment: { type: "neutral", confidence: 0.5 },
        urgency: "medium",
        recommended_services: ["General consultation"],
        pain_points: ["Requires manual review"],
        follow_up_email: {
          subject: "Thank you for contacting Pacific Engineering",
          body: "Thank you for reaching out to Pacific Engineering. We've received your inquiry and will respond shortly. In the meantime, feel free to call us at (415)-419-6079."
        },
        next_steps: ["Manual review required", "Schedule follow-up call"]
      }
    }, { status: 200 }); // Return 200 with fallback instead of 500
  }
});