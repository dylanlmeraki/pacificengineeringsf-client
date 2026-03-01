import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Plus, Edit, Trash2, Send, DollarSign, Calendar, Loader2, Activity } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebhookMonitor from "./WebhookMonitor";

export default function InvoiceManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const queryClient = useQueryClient();

  const [newInvoice, setNewInvoice] = useState({
    invoice_number: `INV-${Date.now()}`,
    project_id: "",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    line_items: [{ description: "", quantity: 1, unit_price: 0, amount: 0 }],
    tax_rate: 0,
    status: "draft",
    terms: "Payment due within 30 days"
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        return await base44.entities.Invoice.list('-created_date', 100);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
        return [];
      }
    }
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-for-invoices'],
    queryFn: async () => {
      try {
        return await base44.entities.Project.list('-created_date', 100);
      } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData) => {
      return await base44.entities.Invoice.create(invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowCreateDialog(false);
      resetForm();
      toast.success("Invoice created successfully");
    },
    onError: (error) => {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Invoice.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setEditingInvoice(null);
      toast.success("Invoice updated");
    },
    onError: (error) => {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    }
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Invoice.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Invoice deleted");
    }
  });

  const sendStripeInvoiceMutation = useMutation({
    mutationFn: async (invoiceId) => {
      const response = await base44.functions.invoke('createStripeInvoice', { invoiceId });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Stripe invoice sent successfully");
    },
    onError: (error) => {
      console.error("Error sending Stripe invoice:", error);
      toast.error("Failed to send Stripe invoice: " + (error.message || "Unknown error"));
    }
  });

  const calculateTotals = (lineItems, taxRate = 0) => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const tax_amount = (subtotal * taxRate) / 100;
    const total = subtotal + tax_amount;
    return { subtotal, tax_amount, total_amount: total };
  };

  const addLineItem = () => {
    const current = editingInvoice || newInvoice;
    const updated = {
      ...current,
      line_items: [...current.line_items, { description: "", quantity: 1, unit_price: 0, amount: 0 }]
    };
    editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
  };

  const updateLineItem = (index, field, value) => {
    const current = editingInvoice || newInvoice;
    const items = [...current.line_items];
    items[index] = { ...items[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      items[index].amount = items[index].quantity * items[index].unit_price;
    }
    
    const totals = calculateTotals(items, current.tax_rate);
    const updated = { ...current, line_items: items, ...totals };
    editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
  };

  const removeLineItem = (index) => {
    const current = editingInvoice || newInvoice;
    const items = current.line_items.filter((_, i) => i !== index);
    const totals = calculateTotals(items, current.tax_rate);
    const updated = { ...current, line_items: items, ...totals };
    editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
  };

  const handleProjectSelect = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const current = editingInvoice || newInvoice;
      const updated = {
        ...current,
        project_id: projectId,
        project_name: project.project_name,
        client_email: project.client_email,
        client_name: project.client_name
      };
      editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
    }
  };

  const resetForm = () => {
    setNewInvoice({
      invoice_number: `INV-${Date.now()}`,
      project_id: "",
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      line_items: [{ description: "", quantity: 1, unit_price: 0, amount: 0 }],
      tax_rate: 0,
      status: "draft",
      terms: "Payment due within 30 days"
    });
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    viewed: "bg-cyan-100 text-cyan-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500"
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="invoices" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="webhooks">
              <Activity className="w-4 h-4 mr-2" />
              Webhook Monitor
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        <TabsContent value="invoices" className="space-y-6">

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
          <div className="text-sm text-gray-600">Total Invoices</div>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-green-600">
            {invoices.filter(i => i.status === 'paid').length}
          </div>
          <div className="text-sm text-gray-600">Paid</div>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-orange-600">
            {invoices.filter(i => i.status === 'overdue').length}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="text-2xl font-bold text-blue-600">
            ${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Collected</div>
        </Card>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">{invoice.invoice_number}</h3>
                  <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Client: <strong>{invoice.client_name}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Project: {invoice.project_name}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${invoice.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {invoice.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => sendStripeInvoiceMutation.mutate(invoice.id)}
                    disabled={sendStripeInvoiceMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {sendStripeInvoiceMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" />
                        Send via Stripe
                      </>
                    )}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setEditingInvoice(invoice)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm(`Delete invoice ${invoice.invoice_number}?`)) {
                      deleteInvoiceMutation.mutate(invoice.id);
                    }
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showCreateDialog || !!editingInvoice} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingInvoice(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Invoice Number</label>
                <Input
                  value={(editingInvoice || newInvoice).invoice_number}
                  onChange={(e) => {
                    const current = editingInvoice || newInvoice;
                    const updated = { ...current, invoice_number: e.target.value };
                    editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select
                  value={(editingInvoice || newInvoice).project_id}
                  onValueChange={handleProjectSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_name} - {project.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Date</label>
                <Input
                  type="date"
                  value={(editingInvoice || newInvoice).issue_date}
                  onChange={(e) => {
                    const current = editingInvoice || newInvoice;
                    const updated = { ...current, issue_date: e.target.value };
                    editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={(editingInvoice || newInvoice).due_date}
                  onChange={(e) => {
                    const current = editingInvoice || newInvoice;
                    const updated = { ...current, due_date: e.target.value };
                    editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Line Items</label>
                <Button size="sm" variant="outline" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {(editingInvoice || newInvoice).line_items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeLineItem(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Rate (%)</label>
                <Input
                  type="number"
                  value={(editingInvoice || newInvoice).tax_rate}
                  onChange={(e) => {
                    const current = editingInvoice || newInvoice;
                    const taxRate = parseFloat(e.target.value) || 0;
                    const totals = calculateTotals(current.line_items, taxRate);
                    const updated = { ...current, tax_rate: taxRate, ...totals };
                    editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={(editingInvoice || newInvoice).status}
                  onValueChange={(value) => {
                    const current = editingInvoice || newInvoice;
                    const updated = { ...current, status: value };
                    editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Terms & Conditions</label>
              <Textarea
                value={(editingInvoice || newInvoice).terms}
                onChange={(e) => {
                  const current = editingInvoice || newInvoice;
                  const updated = { ...current, terms: e.target.value };
                  editingInvoice ? setEditingInvoice(updated) : setNewInvoice(updated);
                }}
                className="h-20"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${((editingInvoice || newInvoice).subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({(editingInvoice || newInvoice).tax_rate}%):</span>
                  <span>${((editingInvoice || newInvoice).tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${((editingInvoice || newInvoice).total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setEditingInvoice(null);
              }}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingInvoice) {
                    updateInvoiceMutation.mutate({ id: editingInvoice.id, data: editingInvoice });
                  } else {
                    createInvoiceMutation.mutate(newInvoice);
                  }
                }}
                disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {(createInvoiceMutation.isPending || updateInvoiceMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save Invoice</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}