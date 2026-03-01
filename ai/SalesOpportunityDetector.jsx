import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Loader2, TrendingUp, DollarSign, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function SalesOpportunityDetector({ prospects = [] }) {
  const [detecting, setDetecting] = useState(false);
  const [opportunities, setOpportunities] = useState([]);

  const detectOpportunities = async () => {
    try {
      setDetecting(true);
      const { data } = await base44.functions.invoke('identifySalesOpportunities', {
        prospectIds: prospects.map(p => p.id)
      });

      setOpportunities(data.opportunities || []);
      toast.success(`Found ${data.opportunities?.length || 0} opportunities!`);
    } catch (error) {
      console.error("Detection error:", error);
      toast.error("Failed to detect opportunities");
    } finally {
      setDetecting(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-blue-100 text-blue-700"
    };
    return colors[priority?.toLowerCase()] || colors.low;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Opportunity Detector</h3>
              <p className="text-sm text-gray-600">Identify high-value sales opportunities</p>
            </div>
          </div>

          <Button
            onClick={detectOpportunities}
            disabled={detecting || prospects.length === 0}
            size="lg"
            className="bg-gradient-to-r from-orange-600 to-amber-600"
          >
            {detecting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Detect Opportunities
              </>
            )}
          </Button>
        </div>
      </Card>

      {opportunities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-900">
              {opportunities.length} Opportunities Detected
            </h4>
            <Badge className="bg-green-100 text-green-700">
              Total Value: ${opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0).toLocaleString()}
            </Badge>
          </div>

          {opportunities.map((opp, idx) => (
            <Card key={idx} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="text-lg font-bold text-gray-900">{opp.prospectName}</h5>
                    <Badge className={getPriorityColor(opp.priority)}>
                      {opp.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{opp.companyName}</p>
                </div>
                {opp.estimatedValue && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${opp.estimatedValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Est. Value</div>
                  </div>
                )}
              </div>

              {/* Opportunity Details */}
              <div className="space-y-3">
                {opp.reason && (
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">Reason:</span>
                      <span className="ml-2 text-gray-600">{opp.reason}</span>
                    </div>
                  </div>
                )}

                {opp.suggestedServices && opp.suggestedServices.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">Suggested Services:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {opp.suggestedServices.map((service, i) => (
                          <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {opp.nextSteps && opp.nextSteps.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">Recommended Next Steps:</span>
                      <ul className="mt-1 space-y-1">
                        {opp.nextSteps.map((step, i) => (
                          <li key={i} className="text-gray-600 flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {opp.confidence && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Confidence Score</span>
                      <Badge className={
                        opp.confidence >= 80 ? "bg-green-100 text-green-700" :
                        opp.confidence >= 60 ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }>
                        {opp.confidence}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}