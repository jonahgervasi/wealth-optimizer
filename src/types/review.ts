import type { ClientIntake } from "./client";
import type { AIAnalysisResult, AdvisorBrief } from "./analysis";

export interface ReviewCase {
  id: string;
  clientIntake: ClientIntake;
  analysisResult: AIAnalysisResult;
  advisorBrief: AdvisorBrief;
  flagReasons: string[];
  createdAt: string;
  reviewed: boolean;
  reviewedAt?: string;
}
