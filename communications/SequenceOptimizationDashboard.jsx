import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SequenceOptimizationDashboard() {
  const { data: logs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sequence_optimization_logs'],
    queryFn: async () => base44.entities.SequenceOptimizationLog.list('-created_date', 200)
  });

  const grouped = logs.reduce((m, l) => {
    const k = l.sequence_id || 'unknown';
    if (!m[k]) m[k] = [];
    m[k].push(l);
    return m;
  }, {});

  if (isLoading) return <div className="p-6">Loading insights…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load insights</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sequence Optimization</h1>
        <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>
      {Object.entries(grouped).map(([seqId, items]) => (
        <Card key={seqId} className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Sequence: {seqId}</CardTitle>
            <Link to={createPageUrl('EmailSequences')}><Button variant="ghost">Open Sequences</Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.slice(0, 5).map((it) => (
              <div key={it.id} className="border rounded-lg p-3">
                <div className="text-xs text-gray-500">{new Date(it.timestamp || it.created_date).toLocaleString()}</div>
                <div className="text-sm font-medium mt-1">{it.log_type.replace(/_/g, ' ')}</div>
                <pre className="text-xs text-gray-700 mt-2 whitespace-pre-wrap break-words max-h-56 overflow-auto">{JSON.stringify(it.details, null, 2)}</pre>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}