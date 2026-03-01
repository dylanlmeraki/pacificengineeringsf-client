import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Plus, X, Save, Trash2 } from "lucide-react";

export default function AdminEmailSettings() {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    setting_name: "",
    recipient_emails: [""],
    form_type: "swppp_consultation",
    active: true
  });

  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['emailSettings'],
    queryFn: () => base44.entities.EmailSettings.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailSettings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
    }
  });

  const resetForm = () => {
    setFormData({
      setting_name: "",
      recipient_emails: [""],
      form_type: "swppp_consultation",
      active: true
    });
    setEditingId(null);
  };

  const handleEdit = (setting) => {
    setFormData({
      setting_name: setting.setting_name,
      recipient_emails: setting.recipient_emails,
      form_type: setting.form_type,
      active: setting.active
    });
    setEditingId(setting.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredEmails = formData.recipient_emails.filter(email => email.trim() !== "");
    
    if (filteredEmails.length === 0) {
      alert("Please add at least one email address");
      return;
    }

    const data = { ...formData, recipient_emails: filteredEmails };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addEmailField = () => {
    setFormData({ ...formData, recipient_emails: [...formData.recipient_emails, ""] });
  };

  const updateEmail = (index, value) => {
    const newEmails = [...formData.recipient_emails];
    newEmails[index] = value;
    setFormData({ ...formData, recipient_emails: newEmails });
  };

  const removeEmail = (index) => {
    const newEmails = formData.recipient_emails.filter((_, i) => i !== index);
    setFormData({ ...formData, recipient_emails: newEmails });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Settings</h1>
          <p className="text-gray-600">Configure email recipients for form submissions</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? "Edit Email Setting" : "Add Email Setting"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Setting Name</Label>
                <Input
                  value={formData.setting_name}
                  onChange={(e) => setFormData({ ...formData, setting_name: e.target.value })}
                  placeholder="e.g., SWPPP Form Recipients"
                  required
                />
              </div>

              <div>
                <Label>Form Type</Label>
                <Select
                  value={formData.form_type}
                  onValueChange={(value) => setFormData({ ...formData, form_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="swppp_consultation">SWPPP Consultation</SelectItem>
                    <SelectItem value="contact_form">Contact Form</SelectItem>
                    <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Recipient Emails</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addEmailField}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.recipient_emails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        placeholder="email@example.com"
                      />
                      {formData.recipient_emails.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeEmail(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="active" className="cursor-pointer">Active</Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Update" : "Create"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Current Settings</h2>
            
            {isLoading ? (
              <Card className="p-6 text-center text-gray-500">Loading...</Card>
            ) : settings.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                No email settings configured yet
              </Card>
            ) : (
              settings.map((setting) => (
                <Card key={setting.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{setting.setting_name}</h3>
                      <p className="text-sm text-gray-600">{setting.form_type}</p>
                      {!setting.active && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(setting)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Delete this email setting?")) {
                            deleteMutation.mutate(setting.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">Recipients:</Label>
                    {setting.recipient_emails.map((email, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{email}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}