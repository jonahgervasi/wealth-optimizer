import type { ClientIntake } from "@/types/client";
import type { AIAnalysisResult } from "@/types/analysis";

export interface RoutingResult {
  shouldRoute: boolean;
  reasons: string[];
}

type RoutingRule = {
  id: string;
  label: string;
  check: (intake: ClientIntake, analysis: AIAnalysisResult) => boolean;
};

const rules: RoutingRule[] = [
  {
    id: "high_income",
    label: "High-income client (>$250k) — complex tax optimization required",
    check: (intake) => intake.annualIncome > 250000,
  },
  {
    id: "us_person",
    label: "US person — FATCA/FBAR reporting, PFIC rules, cross-border tax complexity",
    check: (intake) => intake.isUSPerson,
  },
  {
    id: "db_pension_with_spouse",
    label: "DB pension + spouse — income splitting and pension optimization needed",
    check: (intake) => intake.hasDBPension && intake.hasSpouse,
  },
  {
    id: "low_confidence",
    label: "Low AI confidence — scenario complexity exceeds automated analysis",
    check: (_, analysis) => analysis.confidenceLevel === "low",
  },
  {
    id: "large_nonreg",
    label: "Significant non-registered holdings (>$100k) — capital gains strategy required",
    check: (intake) => intake.nonRegBalance > 100000,
  },
  {
    id: "multiple_complexity_flags",
    label: "Multiple complexity flags — requires holistic advisor review",
    check: (_, analysis) => analysis.complexityFlags.length >= 3,
  },
];

export function evaluateRoutingRules(
  intake: ClientIntake,
  analysis: AIAnalysisResult
): RoutingResult {
  const triggeredReasons: string[] = [];

  for (const rule of rules) {
    if (rule.check(intake, analysis)) {
      triggeredReasons.push(rule.label);
    }
  }

  return {
    shouldRoute: triggeredReasons.length > 0,
    reasons: triggeredReasons,
  };
}
