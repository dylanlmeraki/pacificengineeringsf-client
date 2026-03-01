import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TemplateForm from '@/components/communications/TemplateForm';

export default function EmailTemplates() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const { data: templates = [] } = useQuery({ queryKey: ['email-templates'], queryFn: ()=> base44.entities.EmailTemplate.list('-updated_date', 100), initialData: [] });

  const upsert = useMutation({
    mutationFn: (t)=> t.id ? base44.entities.EmailTemplate.update(t.id, t) : base44.entities.EmailTemplate.create(t),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ['email-templates'] })
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Button onClick={()=>setEditing({})}>New Template</Button>
      </div>

      {editing && (
        <Card className="p-4 mb-6">
          <TemplateForm template={editing} onCancel={()=>setEditing(null)} onSave={(data)=>{ upsert.mutate(data); setEditing(null); }} />
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {templates.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t.template_name}</h3>
                <div className="text-sm text-gray-500">{t.category || 'General'} • {t.active ? 'Active' : 'Inactive'}</div>
              </div>
              <Button variant="outline" onClick={()=>setEditing(t)}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}