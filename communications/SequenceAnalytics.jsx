import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function SequenceAnalytics({ sequenceId }) {
  const { data: items = [] } = useQuery({
    queryKey: ['sequence-analytics', sequenceId],
    queryFn: async () => {
      const all = await base44.entities.SalesOutreach.filter({ sequence_id: sequenceId }, '-sent_date', 500);
      return all;
    },
    enabled: !!sequenceId,
    initialData: []
  });

  const total = items.length || 0;
  const opens = items.filter(i => i.opened || (i.open_count || 0) > 0).length;
  const clicks = items.filter(i => i.clicked || (i.click_count || 0) > 0).length;

  const aItems = items.filter(i => i.ab_variant === 'A');
  const bItems = items.filter(i => i.ab_variant === 'B');

  const rate = (n, d) => (d ? `${((n / d) * 100).toFixed(1)}%` : '0.0%');

  return (
    <div className="text-sm text-gray-600 mt-2">
      <div>Opens: <span className="font-semibold">{opens}/{total}</span> ({rate(opens, total)}) • Clicks: <span className="font-semibold">{clicks}/{total}</span> ({rate(clicks, total)})</div>
      {(aItems.length + bItems.length > 0) && (
        <div className="mt-1">
          <div className="text-xs">A/B Performance</div>
          <div className="text-xs">A: {rate(aItems.filter(i => i.opened || (i.open_count||0)>0).length, aItems.length)} • B: {rate(bItems.filter(i => i.opened || (i.open_count||0)>0).length, bItems.length)}</div>
        </div>
      )}
    </div>
  );
}