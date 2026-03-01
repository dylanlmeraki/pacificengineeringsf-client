/**
 * Resend Email Integration for Pacific Engineering
 * 
 * REFERENCE FILE — Copy to your Node.js backend project at:
 *   src/routes/integrations.ts (email section)
 *   src/lib/email.ts (utility)
 * 
 * Prerequisites:
 *   pnpm add resend
 * 
 * Environment Variables:
 *   RESEND_API_KEY — Your Resend API key
 *   FROM_EMAIL — Default sender email (e.g., notifications@pacificengineeringsf.com)
 *   FROM_NAME — Default sender name (e.g., Pacific Engineering)
 */

import { Resend } from 'resend';
import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/middleware';

// ===== src/lib/email.ts — Email utility =====

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = `${process.env.FROM_NAME || 'Pacific Engineering'} <${process.env.FROM_EMAIL || 'notifications@pacificengineeringsf.com'}>`;

/**
 * Send a transactional email via Resend
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  body: string;        // HTML body
  from_name?: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}) {
  const from = params.from_name 
    ? `${params.from_name} <${process.env.FROM_EMAIL || 'notifications@pacificengineeringsf.com'}>`
    : DEFAULT_FROM;

  const result = await resend.emails.send({
    from,
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.body,
    reply_to: params.reply_to,
    cc: params.cc,
    bcc: params.bcc,
    attachments: params.attachments?.map(a => ({
      filename: a.filename,
      content: typeof a.content === 'string' ? Buffer.from(a.content) : a.content,
    })),
  });

  return result;
}

/**
 * Send a templated notification email
 */
export async function sendNotificationEmail(params: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  cta_text?: string;
  cta_url?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f4f4f5;">
      <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
        <div style="background:#ffffff; border-radius:12px; padding:40px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Logo -->
          <div style="text-align:center; margin-bottom:32px;">
            <h2 style="color:#1e293b; margin:0;">Pacific Engineering</h2>
          </div>
          
          <!-- Heading -->
          <h1 style="color:#1e293b; font-size:20px; margin:0 0 16px;">${params.heading}</h1>
          
          <!-- Body -->
          <div style="color:#475569; font-size:15px; line-height:1.6;">
            ${params.body}
          </div>
          
          ${params.cta_text && params.cta_url ? `
          <!-- CTA Button -->
          <div style="text-align:center; margin:32px 0;">
            <a href="${params.cta_url}" 
               style="display:inline-block; background:#2563eb; color:#ffffff; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px;">
              ${params.cta_text}
            </a>
          </div>
          ` : ''}
          
          <!-- Footer -->
          <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e2e8f0; color:#94a3b8; font-size:13px; text-align:center;">
            Pacific Engineering SF &bull; San Francisco, CA<br>
            <a href="https://pacificengineeringsf.com" style="color:#64748b;">pacificengineeringsf.com</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: params.subject,
    body: html,
  });
}


// ===== Express route for email sending =====

const emailRouter = Router();

/**
 * POST /api/integrations/email
 * Send an email (authenticated users only)
 */
emailRouter.post('/email', requireAuth, async (req: Request, res: Response) => {
  const { to, subject, body, from_name, reply_to, cc, bcc } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'to, subject, and body are required' });
  }

  const result = await sendEmail({ to, subject, body, from_name, reply_to, cc, bcc });

  if (result.error) {
    return res.status(500).json({ error: result.error.message });
  }

  return res.json({ success: true, id: result.data?.id });
});

export { emailRouter, sendEmail, sendNotificationEmail };