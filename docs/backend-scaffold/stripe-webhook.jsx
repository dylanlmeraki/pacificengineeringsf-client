/**
 * Stripe Webhook & Payment Routes for Pacific Engineering
 * 
 * REFERENCE FILE — Copy to your Node.js backend project at:
 *   src/routes/stripe.ts
 * 
 * Prerequisites:
 *   pnpm add stripe
 * 
 * Environment Variables:
 *   STRIPE_SECRET_KEY — Stripe secret key
 *   STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret
 * 
 * IMPORTANT: The webhook endpoint must receive raw body (not JSON-parsed).
 * This is configured in express-routes.ts:
 *   app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
 */

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { invoices, projects } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../auth/middleware';
import { sendNotificationEmail } from '../lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const stripeRouter = Router();

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 * NOTE: This endpoint receives raw body — do NOT apply JSON middleware
 */
stripeRouter.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    // Use constructEventAsync for Deno/Node.js async crypto compatibility
    event = await stripe.webhooks.constructEventAsync(
      req.body, // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle different event types
  switch (event.type) {
    case 'invoice.paid': {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      
      // Update local invoice record
      if (stripeInvoice.id) {
        await db
          .update(invoices)
          .set({
            status: 'paid',
            paid_date: new Date().toISOString().split('T')[0],
            stripe_payment_intent_id: stripeInvoice.payment_intent as string,
            updated_date: new Date(),
          })
          .where(eq(invoices.stripe_invoice_id, stripeInvoice.id));
      }
      
      console.log(`Invoice ${stripeInvoice.id} marked as paid`);
      break;
    }

    case 'invoice.payment_failed': {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      
      if (stripeInvoice.id) {
        await db
          .update(invoices)
          .set({
            status: 'overdue',
            updated_date: new Date(),
          })
          .where(eq(invoices.stripe_invoice_id, stripeInvoice.id));
      }
      
      // Send notification to admin
      await sendNotificationEmail({
        to: process.env.ADMIN_EMAIL || 'admin@pacificengineeringsf.com',
        subject: 'Payment Failed',
        heading: 'Invoice Payment Failed',
        body: `Payment failed for Stripe invoice ${stripeInvoice.id}. Customer: ${stripeInvoice.customer_email || 'unknown'}.`,
        cta_text: 'View in Stripe',
        cta_url: `https://dashboard.stripe.com/invoices/${stripeInvoice.id}`,
      });
      
      console.log(`Invoice ${stripeInvoice.id} payment failed`);
      break;
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Checkout session ${session.id} completed`);
      // Handle checkout completion — create/update records as needed
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
});

/**
 * POST /api/stripe/create-invoice
 * Create a Stripe invoice from a local invoice record
 */
stripeRouter.post('/create-invoice', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { invoice_id } = req.body;

  // Fetch local invoice
  const [localInvoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoice_id))
    .limit(1);

  if (!localInvoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  // Fetch related project for client info
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, localInvoice.project_id))
    .limit(1);

  if (!project) {
    return res.status(404).json({ error: 'Related project not found' });
  }

  // Create or find Stripe customer
  const customers = await stripe.customers.list({
    email: project.client_email,
    limit: 1,
  });

  let customerId: string;
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: project.client_email,
      name: project.client_name || undefined,
    });
    customerId = customer.id;
  }

  // Create Stripe invoice
  const stripeInvoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true,
    collection_method: 'send_invoice',
    days_until_due: 30,
    description: localInvoice.description || `Invoice for ${project.project_name}`,
  });

  // Add line items
  if (localInvoice.line_items && Array.isArray(localInvoice.line_items)) {
    for (const item of localInvoice.line_items as any[]) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: stripeInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount: Math.round(item.unit_price * 100), // Stripe uses cents
      });
    }
  } else {
    // Single line item
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: stripeInvoice.id,
      description: localInvoice.description || 'Services',
      amount: Math.round(localInvoice.total_amount * 100),
    });
  }

  // Finalize and send
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
  await stripe.invoices.sendInvoice(stripeInvoice.id);

  // Update local record
  await db
    .update(invoices)
    .set({
      stripe_invoice_id: stripeInvoice.id,
      status: 'sent',
      updated_date: new Date(),
    })
    .where(eq(invoices.id, invoice_id));

  return res.json({
    success: true,
    stripe_invoice_id: stripeInvoice.id,
    hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
  });
});

export { stripeRouter };