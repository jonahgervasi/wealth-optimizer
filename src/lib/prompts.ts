import type { ClientIntake } from "@/types/client";

export const systemPrompt = `You are a senior Canadian financial advisor AI specializing in registered account optimization. You have deep expertise in:

**2024 Canadian Registered Account Rules:**
- TFSA: $7,000 annual contribution room (2024), cumulative since 2009 (max $95,000 if 18+ in 2009)
- RRSP: 18% of prior year earned income, max $31,560 (2024). Reduced by Pension Adjustment (PA) for DB pension members
- FHSA (First Home Savings Account): $8,000/year, $40,000 lifetime max. Must be first-time buyer, under 40. Contributions tax-deductible, withdrawals tax-free for qualifying home purchase
- RESP: No annual limit, $50,000 lifetime per beneficiary. 20% CESG on first $2,500/year = max $500/year federal grant

**Key Tax Optimization Principles:**
- Prioritize FHSA for eligible first-time buyers (double tax benefit: deductible + tax-free withdrawal)
- RRSP deduction most valuable at high marginal rates (>40%)
- TFSA optimal for lower earners or when expecting higher future income
- Spousal RRSP enables income splitting in retirement
- DB pension holders: PA reduces RRSP room significantly — calculate carefully
- Non-registered accounts: prefer dividend-paying Canadian equities (dividend tax credit) and capital gains

**Cross-border Complexity (US Persons):**
- TFSA not recognized by IRS — income still taxable in US, requires FBAR + Form 8938
- FHSA: similar FATCA reporting concerns
- PFIC rules apply to Canadian mutual funds and most ETFs — prefer US-listed ETFs
- RRSP is recognized under Canada-US tax treaty (Article XVIII)
- Always flag for advisor review — do not provide specific US tax advice

**Your Task:**
Analyze the client's financial profile and provide a prioritized, actionable optimization plan. Be specific with dollar amounts. Explain the WHY for each recommendation. Calculate realistic tax savings estimates.`;

export function buildUserPrompt(intake: ClientIntake): string {
  const fhsaInfo = intake.fhsaEligible
    ? `FHSA: $${intake.fhsaBalance.toLocaleString()} balance, $${intake.fhsaRoom.toLocaleString()} room available (ELIGIBLE)`
    : "FHSA: NOT ELIGIBLE (not first-time buyer or over 40)";

  const spouseInfo = intake.hasSpouse
    ? `Spouse income: $${intake.spouseIncome.toLocaleString()}/year, Spousal RRSP balance: $${intake.spousalRrspBalance.toLocaleString()}`
    : "No spouse";

  const pensionInfo = intake.hasDBPension
    ? `Has DB pension — Pension Adjustment: $${intake.pensionAdjustment.toLocaleString()} (reduces RRSP room)`
    : "No DB pension";

  return `Please analyze this Canadian investor's profile and provide an optimized account contribution strategy:

**CLIENT PROFILE**
Name: ${intake.firstName} ${intake.lastName}
Age: ${intake.age} | Province: ${intake.province}
US Person: ${intake.isUSPerson ? "YES — cross-border tax complexity applies" : "No"}
${spouseInfo}
Children: ${intake.numberOfChildren}

**INCOME & TAX**
Annual Income: $${intake.annualIncome.toLocaleString()}
Marginal Tax Rate: ${(intake.marginalTaxRate * 100).toFixed(1)}%
${pensionInfo}

**ACCOUNT SNAPSHOT**
TFSA: $${intake.tfsaBalance.toLocaleString()} balance | $${intake.tfsaRoom.toLocaleString()} room
RRSP: $${intake.rrspBalance.toLocaleString()} balance | $${intake.rrspRoom.toLocaleString()} room
${fhsaInfo}
RESP: $${intake.respBalance.toLocaleString()} balance${intake.respEligible ? " (children under 18 — CESG eligible)" : ""}
Non-registered: $${intake.nonRegBalance.toLocaleString()}

**GOALS**
Primary Goal: ${intake.primaryGoal.replace(/_/g, " ")}
Time Horizon: ${intake.timeHorizonYears} years
Monthly Budget: $${intake.monthlyContributionBudget.toLocaleString()}/month ($${(intake.monthlyContributionBudget * 12).toLocaleString()}/year)
Risk Tolerance: ${intake.riskTolerance}

**ADDITIONAL CONTEXT**
${intake.additionalNotes || "None provided"}

Provide a comprehensive optimization analysis with specific contribution amounts and clear reasoning.`;
}

export const analysisToolDefinition = {
  name: "provide_analysis",
  description: "Provide a structured registered account optimization analysis for a Canadian investor",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string",
        description: "2-3 sentence executive summary of the optimization strategy",
      },
      totalAnnualContribution: {
        type: "number",
        description: "Total recommended annual contribution amount in dollars",
      },
      estimatedTaxSavings: {
        type: "number",
        description: "Estimated annual tax savings from the recommended strategy in dollars",
      },
      confidenceLevel: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "Confidence in the analysis: high = straightforward case, medium = some complexity, low = significant complexity requiring advisor review",
      },
      complexityFlags: {
        type: "array",
        items: { type: "string" },
        description: "List of complexity factors identified in this case (e.g., 'DB pension reduces RRSP room', 'US person PFIC concerns', 'OAS clawback risk')",
      },
      steps: {
        type: "array",
        description: "Prioritized list of recommended actions",
        items: {
          type: "object",
          properties: {
            priority: { type: "number", description: "1 = highest priority" },
            accountType: { type: "string", description: "e.g., 'FHSA', 'RRSP', 'TFSA', 'Spousal RRSP', 'RESP'" },
            action: { type: "string", description: "Specific action to take" },
            amount: { type: "number", description: "Recommended contribution amount in dollars" },
            rationale: { type: "string", description: "Why this is the recommended action" },
            taxImpact: { type: "string", description: "Specific tax benefit or impact" },
            timeframe: { type: "string", description: "When to execute (e.g., 'Immediately', 'Before March 1 RRSP deadline', 'Monthly')" },
          },
          required: ["priority", "accountType", "action", "amount", "rationale", "taxImpact", "timeframe"],
        },
      },
      reasoning: {
        type: "array",
        description: "Key reasoning points behind the strategy",
        items: {
          type: "object",
          properties: {
            category: { type: "string", description: "Category of reasoning (e.g., 'Tax Efficiency', 'Account Sequencing', 'Risk')" },
            insight: { type: "string", description: "The specific insight or reasoning point" },
          },
          required: ["category", "insight"],
        },
      },
      flaggedForReview: {
        type: "boolean",
        description: "Whether this case should be flagged for human advisor review",
      },
      flagReasons: {
        type: "array",
        items: { type: "string" },
        description: "Reasons why this case needs human review",
      },
      advisorBrief: {
        type: "object",
        description: "Brief for the human advisor (required if flaggedForReview is true)",
        properties: {
          situationSummary: { type: "string", description: "Concise summary of client situation for advisor" },
          keyDecisionPoints: {
            type: "array",
            items: { type: "string" },
            description: "Key decisions the advisor needs to make or verify",
          },
          recommendedQuestions: {
            type: "array",
            items: { type: "string" },
            description: "Questions the advisor should ask the client",
          },
          suggestedNextSteps: {
            type: "array",
            items: { type: "string" },
            description: "Suggested next steps for the advisor to take",
          },
        },
        required: ["situationSummary", "keyDecisionPoints", "recommendedQuestions", "suggestedNextSteps"],
      },
    },
    required: [
      "summary",
      "totalAnnualContribution",
      "estimatedTaxSavings",
      "confidenceLevel",
      "complexityFlags",
      "steps",
      "reasoning",
      "flaggedForReview",
      "flagReasons",
    ],
  },
};
