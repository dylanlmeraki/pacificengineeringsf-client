import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.10.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return Response.json({ error: 'Missing invoiceId' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });

    // Get invoice from database
    const invoice = await base44.asServiceRole.entities.Invoice.get(invoiceId);
    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if already has Stripe invoice
    if (invoice.stripe_invoice_id) {
      return Response.json({ 
        success: true,
        message: 'Invoice already has Stripe invoice',
        stripe_invoice_id: invoice.stripe_invoice_id
      });
    }

    // Find or create Stripe customer
    let customer;
    const customers = await stripe.customers.list({
      email: invoice.client_email,
      limit: 1
    });

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: invoice.client_email,
        name: invoice.client_name,
        metadata: {
          base44_client_email: invoice.client_email
        }
      });
    }

    // Create invoice items
    const invoiceItems = [];
    for (const item of invoice.line_items || []) {
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customer.id,
        amount: Math.round(item.amount * 100),
        currency: 'usd',
        description: item.description,
        metadata: {
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString()
        }
      });
      invoiceItems.push(invoiceItem);
    }

    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: Math.ceil(
        (new Date(invoice.due_date) - new Date(invoice.issue_date)) / (1000 * 60 * 60 * 24)
      ),
      description: `Invoice for project: ${invoice.project_name}`,
      metadata: {
        base44_invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        project_id: invoice.project_id
      },
      footer: invoice.terms || 'Thank you for your business!'
    });

    // Apply tax if applicable
    if (invoice.tax_rate > 0) {
      await stripe.invoices.update(stripeInvoice.id, {
        default_tax_rates: []
      });
    }

    // Finalize and send
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    await stripe.invoices.sendInvoice(finalizedInvoice.id);

    // Update database invoice
    await base44.asServiceRole.entities.Invoice.update(invoice.id, {
      stripe_invoice_id: stripeInvoice.id,
      status: 'sent'
    });

    // Log activity
    await base44.asServiceRole.entities.AuditLog.create({
      actor_email: user.email,
      actor_name: user.full_name,
      action: 'invoice_sent',
      resource_type: 'Invoice',
      resource_id: invoice.id,
      resource_name: invoice.invoice_number,
      details: `Stripe invoice created and sent. Stripe ID: ${stripeInvoice.id}`
    });

    // Send notification
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: invoice.client_email,
      from_name: 'Pacific Engineering',
      subject: `Invoice ${invoice.invoice_number} - ${invoice.project_name}`,
      body: `
        <h2>New Invoice</h2>
        <p>Hi ${invoice.client_name},</p>
        <p>You have received a new invoice from Pacific Engineering.</p>
        <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
        <p><strong>Amount Due:</strong> $${invoice.total_amount.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
        <p>You can view and pay this invoice through Stripe or your client portal.</p>
        <p>Best regards,<br>Pacific Engineering Team</p>
      `
    });

    return Response.json({
      success: true,
      stripe_invoice_id: stripeInvoice.id,
      stripe_invoice_url: stripeInvoice.hosted_invoice_url,
      message: 'Stripe invoice created and sent successfully'
    });

  } catch (error) {
    console.error('Error creating Stripe invoice:', error);
    
    return Response.json({ 
      error: 'Failed to create Stripe invoice',
      details: error.message,
      type: error.type || 'unknown'
    }, { status: 500 });
  }
});