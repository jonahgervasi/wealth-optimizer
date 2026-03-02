export interface RecommendationStep {
  priority: number;
  accountType: string;
  action: string;
  amount: number;
  rationale: string;
  taxImpact: string;
  timeframe: string;
}

export interface ReasoningPoint {
  category: string;
  insight: string;
}

export interface AIAnalysisResult {
  summary: string;
  totalAnnualContribution: number;
  estimatedTaxSavings: number;
  confidenceLevel: "high" | "medium" | "low";
  complexityFlags: string[];
  steps: RecommendationStep[];
  reasoning: ReasoningPoint[];
  flaggedForReview: boolean;
  flagReasons: string[];
  advisorBrief?: AdvisorBrief;
}

export interface AdvisorBrief {
  situationSummary: string;
  keyDecisionPoints: string[];
  recommendedQuestions: string[];
  suggestedNextSteps: string[];
}
