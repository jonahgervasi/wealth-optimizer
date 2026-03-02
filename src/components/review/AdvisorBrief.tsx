import type { AdvisorBrief as AdvisorBriefType } from "@/types/analysis";

interface AdvisorBriefProps {
  brief: AdvisorBriefType;
}

function BriefSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent/60" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdvisorBrief({ brief }: AdvisorBriefProps) {
  return (
    <div className="mt-4 pt-4 border-t border-navy-500 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md bg-accent/15 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white">Advisor Brief</span>
      </div>

      <div className="bg-navy-700 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Situation Summary</h4>
        <p className="text-sm text-slate-300 leading-relaxed">{brief.situationSummary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BriefSection title="Key Decisions" items={brief.keyDecisionPoints} />
        <BriefSection title="Questions to Ask" items={brief.recommendedQuestions} />
        <BriefSection title="Suggested Next Steps" items={brief.suggestedNextSteps} />
      </div>
    </div>
  );
}
