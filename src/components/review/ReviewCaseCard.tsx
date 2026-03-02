"use client";

import { useState } from "react";
import type { ReviewCase } from "@/types/review";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdvisorBrief } from "./AdvisorBrief";

interface ReviewCaseCardProps {
  reviewCase: ReviewCase;
  onMarkReviewed: (id: string) => Promise<void>;
}

const goalLabel: Record<string, string> = {
  home_purchase: "Home Purchase",
  retirement: "Retirement",
  wealth_building: "Wealth Building",
  education: "Education",
  other: "Other",
};

export function ReviewCaseCard({ reviewCase, onMarkReviewed }: ReviewCaseCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [marking, setMarking] = useState(false);

  const { clientIntake, analysisResult, flagReasons, reviewed, createdAt } = reviewCase;

  const handleMarkReviewed = async () => {
    setMarking(true);
    try {
      await onMarkReviewed(reviewCase.id);
    } finally {
      setMarking(false);
    }
  };

  const createdDate = new Date(createdAt).toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Card className={`transition-all duration-300 ${reviewed ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-white">
              {clientIntake.firstName} {clientIntake.lastName}
            </h3>
            <span className="text-slate-500 text-sm">
              {clientIntake.age} · {clientIntake.province}
            </span>
            {reviewed && (
              <Badge variant="accent" size="sm">Reviewed</Badge>
            )}
          </div>
          <p className="text-sm text-slate-400">
            {goalLabel[clientIntake.primaryGoal]} · ${clientIntake.annualIncome.toLocaleString()} income ·{" "}
            {clientIntake.timeHorizonYears}yr horizon
          </p>
          <p className="text-xs text-slate-500 mt-1">Added {createdDate}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!reviewed && (
            <Button
              size="sm"
              variant="secondary"
              loading={marking}
              onClick={handleMarkReviewed}
            >
              Mark Reviewed
            </Button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Flag Reasons */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {flagReasons.map((reason, i) => (
          <Badge key={i} variant="warning" size="sm">
            {reason.split("—")[0].trim()}
          </Badge>
        ))}
      </div>

      {/* AI Summary */}
      {expanded && (
        <div className="mt-4 space-y-3 animate-fade-in">
          <div className="bg-navy-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={
                analysisResult.confidenceLevel === "high" ? "accent" :
                analysisResult.confidenceLevel === "medium" ? "warning" : "danger"
              }>
                {analysisResult.confidenceLevel} confidence
              </Badge>
              <span className="text-xs text-slate-500">
                ${analysisResult.totalAnnualContribution.toLocaleString()}/yr recommended ·{" "}
                ${analysisResult.estimatedTaxSavings.toLocaleString()} est. tax savings
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{analysisResult.summary}</p>
          </div>

          {/* Top 2 steps preview */}
          <div className="space-y-2">
            {analysisResult.steps.slice(0, 2).map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-navy-600 flex items-center justify-center text-xs text-accent font-bold">
                  {step.priority}
                </span>
                <span className="text-slate-300">
                  <span className="text-white font-medium">{step.accountType}</span>{" "}
                  · ${step.amount.toLocaleString()} — {step.action}
                </span>
              </div>
            ))}
            {analysisResult.steps.length > 2 && (
              <p className="text-xs text-slate-500 ml-8">
                +{analysisResult.steps.length - 2} more recommendations
              </p>
            )}
          </div>

          {/* Advisor Brief */}
          {reviewCase.advisorBrief && (
            <AdvisorBrief brief={reviewCase.advisorBrief} />
          )}
        </div>
      )}
    </Card>
  );
}
