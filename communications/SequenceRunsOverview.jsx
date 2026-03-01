import React from "react";
import { useEffect, useState } from "react";
import * as apiClient from "@/components/services/apiClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SequenceRunsOverview({ selectedSequenceId, refreshCounter = 0 }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const all = await apiClient.list('OutreachSequenceRun', '-updated_date', 200);
      const filtered = selectedSequenceId ? all.filter(r => r.sequence_id === selectedSequenceId) : all;
      setRuns(filtered);
    } catch (e) {
      console.error('Failed to load sequence runs', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRuns();
  }, [selectedSequenceId, refreshCounter]);

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Prospect Sequence Status</h3>
        <button onClick={loadRuns} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>
      {loading ? (
        <div className="text-sm text-gray-600">Loading...</div>
      ) : runs.length === 0 ? (
        <div className="text-sm text-gray-600">No active sequence runs.</div>
      ) : (
        <div className="space-y-3">
          {runs.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-gray-900">{r.prospect_name || r.company_name || r.prospect_id}</div>
                  <div className="text-xs text-gray-500">Prospect ID: {r.prospect_id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Step {r.current_step_index != null ? r.current_step_index + 1 : 1}</Badge>
                  <Badge className={r.status === 'completed' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                    {r.status || 'in_progress'}
                  </Badge>
                  {r.next_scheduled_at && (
                    <Badge variant="outline">Next: {new Date(r.next_scheduled_at).toLocaleString()}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}