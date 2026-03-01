import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function TemplateForm({ template, onSave, onCancel }) {
  const [form, setForm] = useState({
    template_name: '',
    category: '',
    subject: '',
    body_html: '',
    variables: [],
    active: true,
    notes: ''
  });

  useEffect(() => {
    if (template) setForm(template);
  }, [template]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, variables: extractVariables(form) });
  };

  const extractVariables = (f) => {
    const set = new Set((f.subject + ' ' + f.body_html).match(/{{\s*(\w+)\s*}}/g)?.map(v => v.replace(/[{ }]/g, '')) || []);
    return Array.from(set);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="Template name" value={form.template_name} onChange={e=>setForm({ ...form, template_name: e.target.value })} />
      <Input placeholder="Category" value={form.category} onChange={e=>setForm({ ...form, category: e.target.value })} />
      <Input placeholder="Subject" value={form.subject} onChange={e=>setForm({ ...form, subject: e.target.value })} />
      <Textarea placeholder="HTML body (supports {{contact_name}}, {{company_name}})" value={form.body_html} onChange={e=>setForm({ ...form, body_html: e.target.value })} className="min-h-[200px]" />
      <Textarea placeholder="Internal notes / challenger angle" value={form.notes} onChange={e=>setForm({ ...form, notes: e.target.value })} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}