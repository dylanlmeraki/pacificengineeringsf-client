import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function DocApproval() {
  const params = new URLSearchParams(window.location.search);
  const docId = params.get('doc_id') || '';
  const token = params.get('token') || '';

  const [doc, setDoc] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await base44.functions.invoke('getDocForApproval', { doc_id: docId, token });
        if (data?.doc) setDoc(data.doc); else setError(data?.error || 'Unable to load document');
      } catch (e) { setError('Unable to load document'); }
      finally { setLoading(false); }
    })();
  }, [docId, token]);

  const act = async (action) => {
    setSubmitting(true);
    try {
      const payload = { doc_id: docId, action, token, reason: action==='reject'?reason:undefined };
      const { data } = await base44.functions.invoke('approveDoc', payload);
      if (data?.success) { setDoc(data.doc); }
      else { setError(data?.error || 'Action failed'); }
    } catch { setError('Action failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!doc) return <div className="p-6">Not found</div>;

  const accent = '#111827';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span>{doc.title}</span>
            <Badge>{doc.doc_type}</Badge>
            <Badge variant="outline">{doc.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-slate-600 grid grid-cols-2 gap-2">
            <div><b>Project:</b> {doc.project_name || '—'}</div>
            <div><b>Due:</b> {doc.due_date || '—'}</div>
            <div><b>Requested by:</b> {doc.created_by || '—'}</div>
            <div><b>Approver:</b> {doc.approver_email || '—'}</div>
          </div>
          {doc.rendered_body && (
            <div className="border rounded-lg p-4" style={{ borderColor: accent }}>
              <div dangerouslySetInnerHTML={{ __html: doc.rendered_body }} />
            </div>
          )}

          {Array.isArray(doc.attachments_meta) && doc.attachments_meta.length > 0 && (
            <div>
              <div className="font-semibold mb-2">Attachments</div>
              <div className="grid gap-2">
                {doc.attachments_meta.map((a, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm border rounded p-2">
                    <div className="truncate">{a.name}</div>
                    <a href={a.url} target="_blank" className="text-blue-600 underline">View</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button disabled={submitting || doc.status!=='Under Review'} onClick={() => act('approve')} className="bg-slate-900 hover:bg-slate-800">Approve</Button>
            <Button variant="outline" disabled={submitting || doc.status!=='Under Review'} onClick={() => act('reject')}>Reject</Button>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Rejection reason (required to reject)</div>
            <Textarea rows={3} value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Provide reason..." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}