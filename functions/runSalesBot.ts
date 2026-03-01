import { base44 } from "@/api/base44Client";

export default async function runSalesBot({ 
  searchQuery, 
  maxProspects = 10, 
  autoSend = false, 
  minScore = 5,
  icpProfile = null 
}) {
  const errors = [];
  const prospectsFound = [];
  const emailsGenerated = [];
  const emailsSent = [];
  const companiesResearched = [];

  try {
    // Build ICP context
    let icpContext = "";
    if (icpProfile) {
      icpContext = `
TARGET ICP:
- Company Types: ${icpProfile.company_types?.join(", ") || "Any"}
- Locations: ${icpProfile.locations?.join(", ") || "Any"}
- Size Range: ${icpProfile.company_size_min || "Any"} to ${icpProfile.company_size_max || "Any"}
- Revenue Range: ${icpProfile.revenue_min || "Any"} to ${icpProfile.revenue_max || "Any"}
- Decision Makers: ${icpProfile.decision_maker_titles?.join(", ") || "Any"}
- Pain Points: ${icpProfile.pain_points?.join(", ") || "General"}
`;
    }

    // Step 1: Research companies
    const researchPrompt = `You are a B2B lead researcher for Pacific Engineering (SWPPP, inspections, structural engineering).

${icpContext}

Search Query: "${searchQuery}"

Find up to ${maxProspects} companies that match the search and ICP criteria. For each company:
1. Find company name, website, location, size, revenue
2. Identify decision-maker (name, title, email if possible, phone if possible)
3. Find company address
4. Identify key business functions/services they provide
5. Rate them 1-10 based on ICP fit
6. Write a brief reason why they're a good fit

Return JSON array of companies with all fields.`;

    const researchResponse = await base44.integrations.Core.InvokeLLM({
      prompt: researchPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          companies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                company_website: { type: "string" },
                company_location: { type: "string" },
                company_address: { type: "string" },
                company_size: { type: "string" },
                annual_revenue: { type: "string" },
                key_functions: { type: "string" },
                contact_name: { type: "string" },
                contact_title: { type: "string" },
                contact_email: { type: "string" },
                contact_phone: { type: "string" },
                fit_score: { type: "number" },
                fit_reasoning: { type: "string" }
              }
            }
          }
        }
      }
    });

    const companies = researchResponse?.companies || [];
    companiesResearched.push(...companies);

    // Step 2: Filter by min score and create prospects
    for (const company of companies) {
      try {
        if ((company.fit_score || 0) < minScore) continue;

        // Validate required fields
        if (!company.contact_name || !company.company_name) {
          errors.push({ prospect: company.company_name, error: "Missing required fields" });
          continue;
        }

        if (!company.contact_email && !company.contact_phone) {
          errors.push({ prospect: company.company_name, error: "No contact method (email or phone)" });
          continue;
        }

        // Generate email
        const emailPrompt = `Write a personalized cold email using Challenger Sales methodology for:

Company: ${company.company_name}
Contact: ${company.contact_name} (${company.contact_title})
Context: ${company.fit_reasoning}
Key Functions: ${company.key_functions}

We offer: SWPPP services, structural engineering, inspections

Keep it under 150 words. Be specific about their business. Include a clear CTA.
Return JSON with subject and body.`;

        const emailResponse = await base44.integrations.Core.InvokeLLM({
          prompt: emailPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" }
            }
          }
        });

        // Create prospect
        const prospectData = {
          company_name: company.company_name,
          company_type: icpProfile?.company_types?.[0] || "General Contractor",
          company_website: company.company_website || "",
          company_location: company.company_location || "",
          company_address: company.company_address || "",
          company_size: company.company_size || "",
          annual_revenue: company.annual_revenue || "",
          key_functions: company.key_functions || "",
          contact_name: company.contact_name,
          contact_title: company.contact_title || "",
          contact_email: company.contact_email || "",
          contact_phone: company.contact_phone || "",
          prospect_score: company.fit_score * 10,
          fit_score: company.fit_score * 10,
          engagement_score: 0,
          status: "New",
          lead_source: "AI Research",
          notes: company.fit_reasoning || "",
          segment: company.fit_score >= 8 ? "Hot Lead" : company.fit_score >= 6 ? "Warm Lead" : "Cold Lead"
        };

        const prospect = await base44.entities.Prospect.create(prospectData);

        prospectsFound.push({
          ...prospectData,
          prospect_score: company.fit_score,
          fit_reasoning: company.fit_reasoning,
          email_subject: emailResponse.subject,
          email_body: emailResponse.body,
          template_used: "Challenger Sales - Cold Email"
        });

        emailsGenerated.push({ prospect: company.contact_name, subject: emailResponse.subject });

        // Send email if auto-send
        if (autoSend && company.contact_email) {
          try {
            await base44.integrations.Core.SendEmail({
              to: company.contact_email,
              subject: emailResponse.subject,
              body: emailResponse.body
            });

            await base44.entities.SalesOutreach.create({
              prospect_id: prospect.id,
              prospect_name: company.contact_name,
              company_name: company.company_name,
              email_type: "Cold Email 1",
              email_subject: emailResponse.subject,
              email_body: emailResponse.body,
              email_template_used: "Challenger Sales",
              outcome: "Sent"
            });

            emailsSent.push(company.contact_name);
          } catch (emailError) {
            errors.push({ prospect: company.contact_name, error: `Email send failed: ${emailError.message}` });
          }
        }

      } catch (prospectError) {
        errors.push({ prospect: company.company_name, error: prospectError.message });
      }
    }

    // Generate summary
    const summary = `
✅ Sales Bot Complete

📊 Research Results:
- ${companiesResearched.length} companies researched
- ${prospectsFound.length} qualified prospects found (score ≥ ${minScore})
- ${emailsGenerated.length} emails generated
${autoSend ? `- ${emailsSent.length} emails sent automatically` : ''}

${errors.length > 0 ? `⚠️ ${errors.length} errors encountered` : ''}

${prospectsFound.length === 0 ? '💡 Try broadening your search or lowering the minimum score.' : ''}
    `.trim();

    return {
      summary,
      companiesResearched,
      prospectsFound,
      emailsGenerated,
      emailsSent,
      errors
    };

  } catch (error) {
    return {
      summary: `❌ SalesBot Error: ${error.message}`,
      companiesResearched,
      prospectsFound,
      emailsGenerated,
      emailsSent,
      errors: [...errors, { error: error.message }]
    };
  }
}