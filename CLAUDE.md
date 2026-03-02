# WealthOptimizer AI — Architecture Documentation

## Project Overview
Full-stack Next.js 14 prototype demonstrating AI-native registered account optimization for Canadian investors.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark navy/green palette
- **State**: Zustand with sessionStorage persistence
- **AI**: Anthropic Claude (claude-sonnet-4-6) via tool use pattern
- **Deployment**: `npm run dev` locally (or Vercel)

## Key Architecture Decisions

### Claude Tool Use for Structured Output
The analyze API route (`src/app/api/analyze/route.ts`) uses the Anthropic tool use pattern with `tool_choice: { type: "tool", name: "provide_analysis" }` to guarantee structured JSON output. This avoids fragile regex parsing of free-text responses. The tool schema is defined in `src/lib/prompts.ts` (`analysisToolDefinition`).

### Zustand + sessionStorage
State survives page navigation (intake → analysis) without URL params or prop drilling. Uses custom storage adapter pointing to sessionStorage (not localStorage) so data clears on tab close. `StoreProvider` handles hydration with a mounted check to avoid SSR/client mismatch.

### Server-side Review Store
`src/lib/review-store.ts` uses a module-level `Map<id, ReviewCase>`. This resets on server restart — intentional for the demo. For production: swap for PostgreSQL/Redis with appropriate TTL.

### Routing Rules (Server-side)
`src/lib/routing-rules.ts` evaluates 6 rules after Claude returns analysis. Rules fire independently of Claude's own `flaggedForReview` field — they OR together. This ensures deterministic routing for known complexity triggers:
1. High income (>$250k)
2. US Person (FATCA/PFIC complexity)
3. DB pension + spouse (income splitting)
4. Low AI confidence
5. Large non-registered holdings (>$100k)
6. 3+ complexity flags

## 2024 Canadian Tax Context

### Registered Account Limits
| Account | Annual Limit | Lifetime | Notes |
|---------|-------------|----------|-------|
| TFSA | $7,000 | Cumulative | No deduction, tax-free growth |
| RRSP | 18% × income, max $31,560 | — | Reduced by Pension Adjustment |
| FHSA | $8,000 | $40,000 | First-time buyers only, under 40 |
| RESP | None | $50,000/beneficiary | 20% CESG on first $2,500/yr |

### Provincial Tax Brackets
Federal + provincial marginal rates calculated in `src/lib/tax.ts`. Provinces covered: ON, BC, AB, QC, SK, MB, NS, NB, PE, NL.

### US Person Complexity
TFSA: not recognized by IRS, income still US-taxable, FBAR/Form 8938 required. PFIC rules apply to Canadian mutual funds/ETFs. RRSP recognized under Article XVIII Canada-US tax treaty. Always routes to human review.

## Demo Personas
Located in `src/lib/personas.ts`:
- **Maya Chen** (28, ON, $85k): Simple case — FHSA-first recommendation, no review flag
- **David Park** (52, BC, $310k): Complex — triggers review (income >$250k + DB pension + spouse)
- **Sarah Tremblay** (38, QC, $120k): Edge case — triggers review (US person flag)

## File Structure
```
src/
├── app/
│   ├── layout.tsx              Root layout: NavBar, StoreProvider
│   ├── page.tsx                Client Intake Form
│   ├── analysis/page.tsx       AI Analysis View
│   ├── review-queue/page.tsx   Human Review Queue
│   └── api/
│       ├── analyze/route.ts    POST → Claude analysis
│       └── review-queue/route.ts GET/PATCH review cases
├── components/
│   ├── layout/                 NavBar, PageContainer
│   ├── intake/                 FormSection, DemoPersonaSelector
│   ├── analysis/               FinancialSnapshot, AIRecommendation
│   ├── review/                 ReviewCaseCard, AdvisorBrief
│   └── ui/                     Button, Card, Input, Select, Toggle, Badge, Spinner
├── lib/
│   ├── tax.ts                  Federal + provincial marginal rate calculator
│   ├── personas.ts             3 demo personas
│   ├── routing-rules.ts        6 human review routing rules
│   ├── review-store.ts         Server-side in-memory Map
│   ├── prompts.ts              System prompt + tool schema
│   └── anthropic.ts            Client singleton
├── store/
│   ├── wealth-store.ts         Zustand store
│   └── StoreProvider.tsx       Hydration-safe provider
└── types/
    ├── client.ts               ClientIntake interface
    ├── analysis.ts             AIAnalysisResult, RecommendationStep
    └── review.ts               ReviewCase
```

## Running Locally
```bash
# Set your API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# Install and run
npm install
npm run dev

# Visit http://localhost:3000
```

## Scaling Considerations
- Replace `Map` review store with PostgreSQL + Prisma for persistence
- Add Redis caching for repeated analysis of same profile hash
- Rate limit `/api/analyze` per user/IP
- Add streaming for Claude response to show real-time progress
- Add auth layer (NextAuth) for advisor queue access control
- Consider background job queue (BullMQ) for async analysis with webhook
