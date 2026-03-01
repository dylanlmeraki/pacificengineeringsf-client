import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Save, Trash2, Plus, CheckCircle, Loader2, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function ContactDetailModal({ contact, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(contact || {
    contact_type: "Lead",
    contact_name: "",
    company_name: "",
    email: "",
    phone: "",
    status: "New",
    lead_source: "",
    services_interested: [],
    tags: []
  });
  const [newService, setNewService] = useState("");
  const [newTag, setNewTag] = useState("");

  const { data: activities = [] } = useQuery({
    queryKey: ['contact-activities', contact?.id],
    queryFn: () => contact?.id ? base44.entities.Activity.filter({ contact_id: contact.id }) : Promise.resolve([]),
    enabled: !!contact?.id
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (contact?.id) {
        return await base44.entities.Contact.update(contact.id, data);
      } else {
        return await base44.entities.Contact.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      onClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Contact.delete(contact.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      onClose();
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const addService = () => {
    if (newService && !formData.services_interested?.includes(newService)) {
      setFormData({
        ...formData,
        services_interested: [...(formData.services_interested || []), newService]
      });
      setNewService("");
    }
  };

  const removeService = (service) => {
    setFormData({
      ...formData,
      services_interested: formData.services_interested.filter(s => s !== service)
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag]
      });
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto border-0 shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {contact ? "Edit Contact" : "New Contact"}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="details">Contact Details</TabsTrigger>
              <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Type *
                  </label>
                  <Select
                    value={formData.contact_type}
                    onValueChange={(value) => setFormData({ ...formData, contact_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Prospect">Prospect</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="Partner">Partner</SelectItem>
                      <SelectItem value="Vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                      <SelectItem value="Active Client">Active Client</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="ABC Construction"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Source
                </label>
                <Select
                  value={formData.lead_source}
                  onValueChange={(value) => setFormData({ ...formData, lead_source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website Form">Website Form</SelectItem>
                    <SelectItem value="Consultation Request">Consultation Request</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Trade Show">Trade Show</SelectItem>
                    <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Interested In
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add service"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  />
                  <Button type="button" onClick={addService} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.services_interested?.map((service, idx) => (
                    <Badge key={idx} variant="outline" className="gap-2">
                      {service}
                      <button onClick={() => removeService(service)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, idx) => (
                    <Badge key={idx} className="gap-2 bg-blue-100 text-blue-700">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="activities">
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No activities yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <Card key={activity.id} className="p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{activity.activity_type}</Badge>
                          <Badge className={
                            activity.status === "Completed" ? "bg-green-100 text-green-700" :
                            activity.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }>
                            {activity.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(activity.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{activity.subject}</h4>
                      {activity.description && (
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-6 flex items-center justify-between">
          <div className="flex gap-3">
            {contact && (
              <>
                <Button
                  variant="outline"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                {contact.contact_type === "Lead" && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await base44.functions.invoke('importContactToProspect', { contactId: contact.id });
                        alert(`${contact.contact_name} imported to CRM successfully!`);
                        queryClient.invalidateQueries(['contacts']);
                        onClose();
                      } catch (error) {
                        alert('Failed to import to CRM: ' + error.message);
                      }
                    }}
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Import to CRM
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || !formData.contact_name}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Contact
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}