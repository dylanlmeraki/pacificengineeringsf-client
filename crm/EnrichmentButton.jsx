import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import enrichProspect from "../../functions/enrichProspect";

export default function EnrichmentButton({ prospectId, onEnrichmentComplete, size = "sm" }) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enriched, setEnriched] = useState(false);

  const handleEnrich = async () => {
    setIsEnriching(true);
    try {
      const result = await enrichProspect({ prospectId });
      if (result.success) {
        setEnriched(true);
        setTimeout(() => setEnriched(false), 3000);
        if (onEnrichmentComplete) {
          onEnrichmentComplete(result);
        }
      }
    } catch (error) {
      console.error("Enrichment error:", error);
    }
    setIsEnriching(false);
  };

  if (enriched) {
    return (
      <Button size={size} variant="outline" className="bg-green-50 border-green-300 text-green-700" disabled>
        <CheckCircle className="w-4 h-4 mr-2" />
        Enriched!
      </Button>
    );
  }

  return (
    <Button 
      size={size} 
      variant="outline"
      onClick={handleEnrich}
      disabled={isEnriching}
      className="bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
    >
      {isEnriching ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Enriching...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Enrich Data
        </>
      )}
    </Button>
  );
}