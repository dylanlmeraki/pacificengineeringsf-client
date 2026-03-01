import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This can be called by a cron job or manually by admin
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all non-paid invoices
    const invoices = await base44.asServiceRole.entities.Invoice.list('-due_date', 500);
    
    const updates = [];
    const notifications = [];

    for (const invoice of invoices) {
      if (invoice.status === 'paid' || invoice.status === 'cancelled') {
        continue;
      }

      const dueDate = new Date(invoice.due_date);
      dueDate.setHours(0, 0, 0, 0);

      // Check if overdue
      if (dueDate < today && invoice.status !== 'overdue') {
        try {
          await base44.asServiceRole.entities.Invoice.update(invoice.id, {
            status: 'overdue'
          });
          updates.push(invoice.invoice_number);

          // Send overdue notification
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: invoice.client_email,
            from_name: 'Pacific Engineering',
            subject: `Overdue Invoice Reminder - ${invoice.invoice_number}`,
            body: `
              <h2>Payment Overdue</h2>
              <p>Hi ${invoice.client_name},</p>
              <p>This is a reminder that invoice <strong>${invoice.invoice_number}</strong> is now overdue.</p>
              <p><strong>Amount Due:</strong> $${invoice.total_amount.toFixed(2)}</p>
              <p><strong>Original Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
              <p>Please submit payment as soon as possible to avoid service interruption.</p>
              <p>If you have already paid, please disregard this notice.</p>
              <p>Best regards,<br>Pacific Engineering Team</p>
            `
          });
          notifications.push(invoice.client_email);

          // Log activity
          await base44.asServiceRole.entities.AuditLog.create({
            actor_email: 'system',
            actor_name: 'Automated Check',
            action: 'invoice_overdue',
            resource_type: 'Invoice',
            resource_id: invoice.id,
            resource_name: invoice.invoice_number,
            details: 'Invoice marked as overdue and notification sent'
          });
        } catch (error) {
          console.error(`Error processing invoice ${invoice.invoice_number}:`, error);
        }
      }
    }

    return Response.json({
      success: true,
      checked: invoices.length,
      updated: updates.length,
      notifications_sent: notifications.length,
      overdue_invoices: updates
    });

  } catch (error) {
    console.error('Error checking overdue invoices:', error);
    return Response.json({ 
      error: 'Failed to check overdue invoices',
      details: error.message 
    }, { status: 500 });
  }
});