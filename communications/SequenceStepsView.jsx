import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SequenceStepsView({ sequence }) {
  if (!sequence) return null;
  const steps = sequence.steps || [];

  return (
    <Card className="p-6 border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Sequence Steps</h3>
      {steps.length === 0 ? (
        <p className="text-sm text-gray-600">No steps defined.</p>
      ) : (
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded-r-lg">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="bg-emerald-600 text-white">Step {idx + 1}</Badge>
                {step.name && <Badge variant="outline">{step.name}</Badge>}
                {step.delay_days != null && (
                  <Badge variant="outline">Delay: {step.delay_days}d</Badge>
                )}
                {step.delay_hours != null && (
                  <Badge variant="outline">Delay: {step.delay_hours}h</Badge>
                )}
              </div>
              <div className="text-sm text-gray-700">
                <div>
                  <span className="font-semibold">Template:</span> {step.template_name || step.email_template || step.email_subject || "—"}
                </div>
                <div className="mt-1">
                  <span className="font-semibold">On Open:</span> {step.on_open_action || "continue"}
                </div>
                <div className="mt-1">
                  <span className="font-semibold">On Reply:</span> {step.on_reply_action || "stop"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}