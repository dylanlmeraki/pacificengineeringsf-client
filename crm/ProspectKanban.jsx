import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Mail, Phone, Flame, Eye } from "lucide-react";

export default function ProspectKanban({ prospects, onProspectClick }) {
  const stages = [
    { id: "New", name: "New", color: "bg-gray-100" },
    { id: "Contacted", name: "Contacted", color: "bg-blue-100" },
    { id: "Engaged", name: "Engaged", color: "bg-cyan-100" },
    { id: "Qualified", name: "Qualified", color: "bg-purple-100" },
    { id: "Meeting Scheduled", name: "Meeting", color: "bg-indigo-100" },
    { id: "Proposal Sent", name: "Proposal", color: "bg-yellow-100" },
    { id: "Negotiation", name: "Negotiation", color: "bg-orange-100" },
    { id: "Won", name: "Won", color: "bg-green-100" }
  ];

  const getProspectsByStage = (stageId) => {
    return prospects.filter(p => p.status === stageId);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map(stage => {
        const stageProspects = getProspectsByStage(stage.id);
        const totalValue = stageProspects.reduce((sum, p) => sum + (p.deal_value || 0), 0);
        
        return (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className={`${stage.color} rounded-t-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">{stage.name}</h3>
                <Badge variant="outline">{stageProspects.length}</Badge>
              </div>
              {totalValue > 0 && (
                <p className="text-sm text-gray-700">
                  ${totalValue.toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="space-y-3 p-3 bg-gray-50 rounded-b-xl min-h-[200px]">
              {stageProspects.map(prospect => (
                <Card 
                  key={prospect.id} 
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-white"
                  onClick={() => onProspectClick(prospect)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {prospect.engagement_score >= 60 && <Flame className="w-4 h-4 text-orange-500" />}
                      {prospect.contact_name}
                    </h4>
                    {prospect.prospect_score && (
                      <Badge className="text-xs">{prospect.prospect_score}</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{prospect.company_name}</span>
                  </div>
                  
                  {prospect.deal_value && (
                    <div className="text-xs text-green-700 font-medium mb-2">
                      ${prospect.deal_value.toLocaleString()}
                    </div>
                  )}
                  
                  {prospect.segment && (
                    <Badge variant="outline" className="text-xs">
                      {prospect.segment}
                    </Badge>
                  )}
                  
                  {prospect.next_follow_up && new Date(prospect.next_follow_up) > new Date() && (
                    <div className="text-xs text-blue-600 mt-2">
                      Follow-up: {new Date(prospect.next_follow_up).toLocaleDateString()}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}