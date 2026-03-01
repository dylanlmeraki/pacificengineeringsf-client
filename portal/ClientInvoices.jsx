import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, DollarSign, Calendar, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ClientInvoices({ clientEmail }) {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['client-invoices', clientEmail],
    queryFn: async () => {
      try {
        return await base44.entities.Invoice.filter({ client_email: clientEmail }, '-created_date', 100);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
        return [];
      }
    }
  });

  const handlePayment = async (invoice) => {
    if (!invoice.stripe_invoice_id) {
      toast.error("This invoice is not set up for online payment. Please contact us.");
      return;
    }

    try {
      // Redirect to Stripe hosted invoice page
      const stripe = window.Stripe ? window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) : null;
      
      if (!stripe) {
        // Fallback: open Stripe invoice in new tab
        toast.info("Redirecting to payment page...");
        // Backend should provide the hosted invoice URL
        window.open(`https://invoice.stripe.com/i/${invoice.stripe_invoice_id}`, '_blank');
      } else {
        // Use Stripe.js for better integration
        toast.info("Opening payment interface...");
        window.open(`https://invoice.stripe.com/i/${invoice.stripe_invoice_id}`, '_blank');
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to open payment interface");
    }
  };

  const handleDownload = async (invoice) => {
    // Generate PDF download
    toast.info("PDF generation will be implemented");
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    viewed: "bg-cyan-100 text-cyan-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500"
  };

  const totalOwed = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.total_amount, 0);

  const totalPaid = invoices.filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.total_amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
          <div className="text-sm text-gray-600">Total Invoices</div>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-red-600">${totalOwed.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Amount Due</div>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Paid to Date</div>
        </Card>
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No invoices yet</p>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">{invoice.invoice_number}</h3>
                    <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Project: <strong>{invoice.project_name}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${invoice.total_amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">Total Amount</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Issued: {format(new Date(invoice.issue_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {invoice.line_items && invoice.line_items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Line Items:</p>
                  <div className="space-y-1">
                    {invoice.line_items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.description} (x{item.quantity})
                        </span>
                        <span className="font-medium">${item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(invoice)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                
                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    onClick={() => handlePayment(invoice)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay with Stripe
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}