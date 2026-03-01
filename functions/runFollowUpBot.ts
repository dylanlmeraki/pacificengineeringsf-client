import { base44 } from "@/api/base44Client";

export default async function runFollowUpBot({ daysThreshold = 4, autoSend = false }) {
  const errors = [];
  const followUpsNeeded = [];
  const followUpsSent = [];

  try {
    // Get all prospects
    const prospects = await base44.entities.Prospect.list('-updated_date', 200);
    const outreach = await base44.entities.SalesOutreach.list('-sent_date', 500);

    // Find prospects that need follow-up
    const now = new Date();

    for (const prospect of prospects) {
      try {
        // Get outreach for this prospect
        const prospectOutreach = outreach.filter(o => o.prospect_id === prospect.id);
        if (prospectOutreach.length === 0) continue;

        // Get last outreach
        const lastOutreach = prospectOutreach[0]; // Already sorted by -sent_date
        const lastContactDate = new Date(lastOutreach.sent_date);
        const daysSinceContact = (now - lastContactDate) / (1000 * 60 * 60 * 24);

        // Skip if too recent
        if (daysThreshold && daysSinceContact < daysThreshold) continue;

        // Skip if already replied or not interested
        if (lastOutreach.replied || lastOutreach.outcome === "Not Interested") continue;

        // Count opens (engagement indicator)
        const openCount = prospectOutreach.filter(o => o.opened).length;

        // Determine follow-up type based on engagement
        let template, engagement;
        if (openCount === 0) {
          template = "No Opens - Resend with Different Angle";
          engagement = "Not Opened";
        } else if (openCount === 1) {
          template = "Opened Once - Value-Add Follow-Up";
          engagement = "Opened 1x";
        } else {
          template = "High Engagement - Specific Offer";
          engagement = `Opened ${openCount}x - HOT`;
        }

        // Generate follow-up email
        const emailPrompt = `Write a follow-up email for:

Contact: ${prospect.contact_name} at ${prospect.company_name}
Previous Email: "${lastOutreach.email_subject}"
Engagement: ${engagement}
Template: ${template}

${openCount === 0 ? 'They never opened the first email. Try a completely different subject line and angle.' : ''}
${openCount === 1 ? 'They opened once but didn\'t reply. Provide additional value or case study.' : ''}
${openCount >= 2 ? 'High engagement! Make a specific offer or request a meeting.' : ''}

Keep under 120 words. Return JSON with subject and body.`;

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

        followUpsNeeded.push({
          name: prospect.contact_name,
          company: prospect.company_name,
          to: prospect.contact_email,
          subject: emailResponse.subject,
          body: emailResponse.body,
          template,
          engagement,
          openCount,
          daysSinceContact: Math.round(daysSinceContact)
        });

        // Send if auto-send
        if (autoSend && prospect.contact_email) {
          try {
            await base44.integrations.Core.SendEmail({
              to: prospect.contact_email,
              subject: emailResponse.subject,
              body: emailResponse.body
            });

            await base44.entities.SalesOutreach.create({
              prospect_id: prospect.id,
              prospect_name: prospect.contact_name,
              company_name: prospect.company_name,
              email_type: openCount >= 2 ? "Follow-up 3" : openCount === 1 ? "Follow-up 2" : "Follow-up 1",
              email_subject: emailResponse.subject,
              email_body: emailResponse.body,
              email_template_used: template,
              outcome: "Sent"
            });

            followUpsSent.push(prospect.contact_name);
          } catch (emailError) {
            errors.push({ prospect: prospect.contact_name, error: `Email send failed: ${emailError.message}` });
          }
        }

      } catch (prospectError) {
        errors.push({ prospect: prospect.contact_name, error: prospectError.message });
      }
    }

    // Generate summary
    const summary = `
✅ Follow-Up Bot Complete

📊 Results:
- ${prospects.length} total prospects checked
- ${followUpsNeeded.length} prospects need follow-up
${autoSend ? `- ${followUpsSent.length} follow-up emails sent` : ''}

🔥 High Engagement: ${followUpsNeeded.filter(f => f.openCount >= 2).length}
👁️ Opened Once: ${followUpsNeeded.filter(f => f.openCount === 1).length}
📭 No Opens: ${followUpsNeeded.filter(f => f.openCount === 0).length}

${errors.length > 0 ? `⚠️ ${errors.length} errors encountered` : ''}
    `.trim();

    return {
      summary,
      followUpsNeeded,
      followUpsSent,
      errors
    };

  } catch (error) {
    return {
      summary: `❌ Follow-Up Bot Error: ${error.message}`,
      followUpsNeeded,
      followUpsSent,
      errors: [...errors, { error: error.message }]
    };
  }
}