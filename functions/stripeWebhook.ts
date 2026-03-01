import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.10.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });

    const sig = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Log webhook receipt
    const webhookLog = await base44.asServiceRole.entities.WebhookLog.create({
      event_type: event.type,
      event_id: event.id,
      status: 'processing',
      payload: event.data.object
    });

    try {
      // Handle the event
      switch (event.type) {
        case 'invoice.paid':
          await handleInvoicePaid(base44, event.data.object, webhookLog.id);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(base44, event.data.object, webhookLog.id);
          break;

        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(base44, event.data.object, webhookLog.id);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(base44, event.data.object, webhookLog.id);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Mark as success
      await base44.asServiceRole.entities.WebhookLog.update(webhookLog.id, {
        status: 'success',
        processed_at: new Date().toISOString()
      });

      return Response.json({ received: true, event_type: event.type });
    } catch (handlerError) {
      // Mark as failed
      await base44.asServiceRole.entities.WebhookLog.update(webhookLog.id, {
        status: 'failed',
        error_message: handlerError.message,
        processed_at: new Date().toISOString()
      });
      throw handlerError;
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
});

async function handleInvoicePaid(base44, stripeInvoice, logId) {
  try {
    const invoices = await base44.asServiceRole.entities.Invoice.filter({
      stripe_invoice_id: stripeInvoice.id
    });

    if (invoices.length === 0) {
      console.warn(`No invoice found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }

    const invoice = invoices[0];

    // Update webhook log with invoice reference
    await base44.asServiceRole.entities.WebhookLog.update(logId, {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number
    });

    await base44.asServiceRole.entities.Invoice.update(invoice.id, {
      status: 'paid',
      paid_date: new Date(stripeInvoice.status_transitions.paid_at * 1000).toISOString(),
      payment_method: 'stripe'
    });

    // Send confirmation email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: invoice.client_email,
      from_name: 'Pacific Engineering',
      subject: `Payment Received - Invoice ${invoice.invoice_number}`,
      body: `
        <h2>Payment Confirmed</h2>
        <p>Hi ${invoice.client_name},</p>
        <p>We have received your payment for invoice <strong>${invoice.invoice_number}</strong>.</p>
        <p>Amount paid: <strong>$${invoice.total_amount.toFixed(2)}</strong></p>
        <p>Payment date: ${new Date().toLocaleDateString()}</p>
        <p>Thank you for your business!</p>
        <p>Best regards,<br>Pacific Engineering Team</p>
      `
    });

    // Log activity
    await base44.asServiceRole.entities.AuditLog.create({
      actor_email: 'system',
      actor_name: 'Stripe Webhook',
      action: 'invoice_paid',
      resource_type: 'Invoice',
      resource_id: invoice.id,
      resource_name: invoice.invoice_number,
      details: `Payment received via Stripe. Amount: $${invoice.total_amount}`
    });

    console.log(`Invoice ${invoice.invoice_number} marked as paid`);
  } catch (error) {
    console.error('Error handling invoice paid:', error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(base44, stripeInvoice, logId) {
  try {
    const invoices = await base44.asServiceRole.entities.Invoice.filter({
      stripe_invoice_id: stripeInvoice.id
    });

    if (invoices.length === 0) {
      console.warn(`No invoice found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }

    const invoice = invoices[0];

    await base44.asServiceRole.entities.Invoice.update(invoice.id, {
      status: 'overdue',
      notes: `Payment failed: ${stripeInvoice.last_finalization_error?.message || 'Unknown error'}`
    });

    // Notify admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: invoice.client_email,
      from_name: 'Pacific Engineering',
      subject: `Payment Failed - Invoice ${invoice.invoice_number}`,
      body: `
        <h2>Payment Failed</h2>
        <p>Hi ${invoice.client_name},</p>
        <p>We were unable to process payment for invoice <strong>${invoice.invoice_number}</strong>.</p>
        <p>Amount due: <strong>$${invoice.total_amount.toFixed(2)}</strong></p>
        <p>Please update your payment method and try again.</p>
        <p>If you need assistance, please contact us.</p>
        <p>Best regards,<br>Pacific Engineering Team</p>
      `
    });

    console.log(`Invoice ${invoice.invoice_number} payment failed`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(base44, paymentIntent, logId) {
  try {
    const invoices = await base44.asServiceRole.entities.Invoice.filter({
      stripe_payment_intent_id: paymentIntent.id
    });

    if (invoices.length > 0) {
      const invoice = invoices[0];
      
      await base44.asServiceRole.entities.Invoice.update(invoice.id, {
        status: 'paid',
        paid_date: new Date().toISOString(),
        payment_method: 'stripe'
      });

      await base44.asServiceRole.entities.AuditLog.create({
        actor_email: 'system',
        actor_name: 'Stripe Webhook',
        action: 'payment_succeeded',
        resource_type: 'Invoice',
        resource_id: invoice.id,
        resource_name: invoice.invoice_number,
        details: `Payment intent succeeded. Amount: $${paymentIntent.amount / 100}`
      });

      console.log(`Payment succeeded for invoice ${invoice.invoice_number}`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

async function handlePaymentFailed(base44, paymentIntent, logId) {
  try {
    const invoices = await base44.asServiceRole.entities.Invoice.filter({
      stripe_payment_intent_id: paymentIntent.id
    });

    if (invoices.length > 0) {
      const invoice = invoices[0];
      
      await base44.asServiceRole.entities.Invoice.update(invoice.id, {
        status: 'overdue',
        notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`
      });

      console.log(`Payment failed for invoice ${invoice.invoice_number}`);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}