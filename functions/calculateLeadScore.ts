// Local helper function for calculating lead scores
// This runs client-side, not as a backend function

export function calculateLeadScore({ prospect, interactions = [], outreach = [] }) {
  let fit_score = prospect?.fit_score || 50;
  let engagement_score = prospect?.engagement_score || 0;
  
  // Calculate engagement based on interactions
  if (interactions.length > 0) {
    const recentInteractions = interactions.filter(i => {
      const date = new Date(i.interaction_date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return date > thirtyDaysAgo;
    });
    
    engagement_score = Math.min(100, recentInteractions.length * 10);
    
    // Boost for positive interactions
    const positiveInteractions = recentInteractions.filter(i => 
      i.outcome === "Positive" || i.sentiment === "Positive" || i.sentiment === "Very Positive"
    );
    engagement_score = Math.min(100, engagement_score + positiveInteractions.length * 5);
  }
  
  // Boost engagement for email responses
  const replies = outreach.filter(o => o.replied);
  engagement_score = Math.min(100, engagement_score + replies.length * 15);
  
  // Calculate overall score
  const prospect_score = Math.round((fit_score * 0.4) + (engagement_score * 0.6));
  
  // Calculate probability based on status
  let probability = 10;
  const statusProbabilities = {
    "New": 10,
    "Researched": 15,
    "Contacted": 20,
    "Engaged": 35,
    "Qualified": 50,
    "Meeting Scheduled": 60,
    "Proposal Sent": 70,
    "Negotiation": 80,
    "Won": 100,
    "Lost": 0,
    "Nurture": 15
  };
  probability = statusProbabilities[prospect?.status] || 10;
  
  // Determine segment
  let segment = "Cold Lead";
  if (engagement_score >= 70 || prospect_score >= 75) {
    segment = "Hot Lead";
  } else if (engagement_score >= 40 || prospect_score >= 50) {
    segment = "Warm Lead";
  }
  
  if (prospect?.deal_value >= 50000) {
    segment = "High Value";
  }
  
  return {
    fit_score,
    engagement_score,
    prospect_score,
    probability,
    segment
  };
}

export default calculateLeadScore;