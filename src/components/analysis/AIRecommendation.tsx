import type { AIAnalysisResult } from "@/types/analysis";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface AIRecommendationProps {
  result: AIAnalysisResult;
}

const accountColors: Record<string, string> = {
  FHSA: "text-purple-400",
  RRSP: "text-blue-400",
  TFSA: "text-accent",
  "Spousal RRSP": "text-pink-400",
  RESP: "text-yellow-400",
  "Non-Registered": "text-slate-300",
};

const confidenceConfig = {
  high: { label: "High Confidence", variant: "accent" as const },
  medium: { label: "Medium Confidence", variant: "warning" as const },
  low: { label: "Low Confidence", variant: "danger" as const },
};

export function AIRecommendation({ result }: AIRecommendationProps) {
  const conf = confidenceConfig[result.confidenceLevel];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Review Flag Banner */}
      {result.flaggedForReview && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-yellow-400 flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-yellow-400">Flagged for Human Review</p>
            <p className="text-xs text-yellow-400/80 mt-0.5">
              This case has been routed to your advisor queue. An advisor brief has been generated.
            </p>
            {result.flagReasons.length > 0 && (
              <ul className="mt-2 space-y-1">
                {result.flagReasons.map((reason, i) => (
                  <li key={i} className="text-xs text-yellow-300/70 flex items-start gap-1.5">
                    <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-yellow-400/60" />
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Summary Card */}
      <Card accent>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold text-white">Optimization Strategy</h2>
          <Badge variant={conf.variant}>{conf.label}</Badge>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-navy-700 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">Recommended Annual Contribution</p>
            <p className="text-xl font-bold text-white">
              ${result.totalAnnualContribution.toLocaleString()}
            </p>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">Estimated Tax Savings</p>
            <p className="text-xl font-bold text-accent">
              ${result.estimatedTaxSavings.toLocaleString()}
            </p>
          </div>
        </div>

        {result.complexityFlags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.complexityFlags.map((flag, i) => (
              <Badge key={i} variant="warning" size="sm">{flag}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Priority Steps */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
          Prioritized Action Plan
        </h3>
        <div className="space-y-4">
          {result.steps.map((step, i) => (
            <div
              key={i}
              className="border border-navy-500 rounded-xl p-4 hover:border-navy-400 transition-colors duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-navy-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">{step.priority}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-sm font-semibold ${accountColors[step.accountType] || "text-white"}`}>
                      {step.accountType}
                    </span>
                    <span className="text-slate-400 text-sm">·</span>
                    <span className="text-sm font-medium text-white">
                      ${step.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 ml-auto">{step.timeframe}</span>
                  </div>
                  <p className="text-sm text-white mb-2">{step.action}</p>
                  <p className="text-xs text-slate-400 mb-1.5">{step.rationale}</p>
                  <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-lg px-2.5 py-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-accent">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs text-accent">{step.taxImpact}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reasoning Chain */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
          Reasoning Chain
        </h3>
        <div className="space-y-3">
          {result.reasoning.map((point, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">
                  {point.category}
                </p>
                <p className="text-sm text-slate-300 mt-0.5">{point.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
