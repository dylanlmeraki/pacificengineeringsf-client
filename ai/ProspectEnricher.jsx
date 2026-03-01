import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle, Globe, Briefcase, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function ProspectEnricher({ prospect, onEnrichmentComplete }) {
  const [enriching, setEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);

  const enrichProspect = async () => {
    try {
      setEnriching(true);
      const { data } = await base44.functions.invoke('enrichProspect', {
        prospectId: prospect.id
      });

      setEnrichedData(data.enrichedData);
      toast.success("Prospect enriched successfully!");
      
      if (onEnrichmentComplete) {
        onEnrichmentComplete(data.enrichedData);
      }
    } catch (error) {
      console.error("Enrichment error:", error);
      toast.error("Failed to enrich prospect data");
    } finally {
      setEnriching(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={enrichProspect}
        disabled={enriching}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
      >
        {enriching ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enriching Data...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Enrich Prospect
          </>
        )}
      </Button>

      {enrichedData && (
        <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-900">Enriched Data</span>
          </div>

          {enrichedData.companyInfo && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-indigo-600 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">Industry:</span>
                  <span className="ml-2 text-gray-600">{enrichedData.companyInfo.industry}</span>
                </div>
              </div>

              {enrichedData.companyInfo.employees && (
                <div className="flex items-start gap-2 text-sm">
                  <Users className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Employees:</span>
                    <span className="ml-2 text-gray-600">{enrichedData.companyInfo.employees}</span>
                  </div>
                </div>
              )}

              {enrichedData.companyInfo.revenue && (
                <div className="flex items-start gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Revenue:</span>
                    <span className="ml-2 text-gray-600">{enrichedData.companyInfo.revenue}</span>
                  </div>
                </div>
              )}

              {enrichedData.companyInfo.website && (
                <div className="flex items-start gap-2 text-sm">
                  <Globe className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Website:</span>
                    <a 
                      href={enrichedData.companyInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-indigo-600 hover:text-indigo-700 underline"
                    >
                      {enrichedData.companyInfo.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {enrichedData.socialProfiles && (
            <div className="pt-2">
              <span className="text-sm font-medium text-gray-700">Social Profiles:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(enrichedData.socialProfiles).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {enrichedData.fitScore !== undefined && (
            <div className="pt-2 border-t border-indigo-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">ICP Fit Score</span>
                <Badge className={
                  enrichedData.fitScore >= 80 ? "bg-green-100 text-green-700" :
                  enrichedData.fitScore >= 60 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }>
                  {enrichedData.fitScore}/100
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}