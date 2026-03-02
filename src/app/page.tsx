"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWealthStore } from "@/store/wealth-store";
import { PageContainer } from "@/components/layout/PageContainer";
import { FormSection } from "@/components/intake/FormSection";
import { DemoPersonaSelector } from "@/components/intake/DemoPersonaSelector";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { calculateMarginalTaxRate, formatTaxRate } from "@/lib/tax";
import type { Province, GoalType } from "@/types/client";
import type { DemoPersona } from "@/lib/personas";

const provinceOptions = [
  { value: "ON", label: "Ontario" },
  { value: "BC", label: "British Columbia" },
  { value: "AB", label: "Alberta" },
  { value: "QC", label: "Québec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "MB", label: "Manitoba" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NB", label: "New Brunswick" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "NL", label: "Newfoundland & Labrador" },
];

const goalOptions = [
  { value: "home_purchase", label: "Home Purchase" },
  { value: "retirement", label: "Retirement Planning" },
  { value: "wealth_building", label: "Wealth Building" },
  { value: "education", label: "Education (RESP)" },
  { value: "other", label: "Other" },
];

const riskOptions = [
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
];

export default function IntakePage() {
  const router = useRouter();
  const { clientIntake, setClientIntake, setAnalysisResult, setIsAnalyzing } = useWealthStore();
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleField = useCallback(
    (field: string, value: unknown) => {
      const updates: Record<string, unknown> = { [field]: value };

      // Auto-calculate marginal tax rate when income or province changes
      if (field === "annualIncome" || field === "province") {
        if (!clientIntake.taxRateOverride) {
          const income = field === "annualIncome" ? (value as number) : clientIntake.annualIncome;
          const province = field === "province" ? (value as Province) : clientIntake.province;
          updates.marginalTaxRate = calculateMarginalTaxRate(income, province);
        }
      }

      // Auto-clear FHSA eligibility if age >= 40
      if (field === "age" && (value as number) >= 40) {
        updates.fhsaEligible = false;
      }

      // Auto-set RESP eligibility based on children count
      if (field === "numberOfChildren") {
        updates.respEligible = (value as number) > 0;
      }

      setClientIntake(updates as Partial<typeof clientIntake>);
    },
    [clientIntake, setClientIntake]
  );

  const loadPersona = (persona: DemoPersona) => {
    const rate = calculateMarginalTaxRate(persona.intake.annualIncome, persona.intake.province);
    setClientIntake({ ...persona.intake, marginalTaxRate: rate });
    setShowPersonaSelector(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!clientIntake.firstName.trim()) newErrors.firstName = "Required";
    if (!clientIntake.lastName.trim()) newErrors.lastName = "Required";
    if (clientIntake.age < 18 || clientIntake.age > 90) newErrors.age = "Enter a valid age (18–90)";
    if (clientIntake.annualIncome < 0) newErrors.annualIncome = "Must be ≥ 0";
    if (clientIntake.monthlyContributionBudget < 0) newErrors.monthlyContributionBudget = "Must be ≥ 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    router.push("/analysis");
  };

  const taxRateDisplay = Math.round(clientIntake.marginalTaxRate * 1000) / 10;

  return (
    <PageContainer maxWidth="lg">
      {showPersonaSelector && (
        <DemoPersonaSelector
          onSelect={loadPersona}
          onClose={() => setShowPersonaSelector(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Intake</h1>
          <p className="text-slate-400 mt-1">
            Enter client financial details to generate an AI-powered registered account optimization strategy
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowPersonaSelector(true)}
          className="flex-shrink-0 mt-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Load Demo
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info */}
        <FormSection
          title="Personal Information"
          description="Basic demographics for tax jurisdiction and account eligibility"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={clientIntake.firstName}
              onChange={(e) => handleField("firstName", e.target.value)}
              error={errors.firstName}
              placeholder="Jane"
            />
            <Input
              label="Last Name"
              value={clientIntake.lastName}
              onChange={(e) => handleField("lastName", e.target.value)}
              error={errors.lastName}
              placeholder="Smith"
            />
            <Input
              label="Age"
              type="number"
              min={18}
              max={90}
              value={clientIntake.age || ""}
              onChange={(e) => handleField("age", parseInt(e.target.value) || 0)}
              error={errors.age}
            />
            <Select
              label="Province of Residence"
              value={clientIntake.province}
              onChange={(e) => handleField("province", e.target.value as Province)}
              options={provinceOptions}
            />
          </div>
          <div className="mt-4 space-y-3">
            <Toggle
              checked={clientIntake.isUSPerson}
              onChange={(v) => handleField("isUSPerson", v)}
              label="US Person (citizen or green card holder)"
              description="FATCA/FBAR reporting applies — triggers cross-border advisor review"
            />
            <Toggle
              checked={clientIntake.hasSpouse}
              onChange={(v) => handleField("hasSpouse", v)}
              label="Has spouse or common-law partner"
              description="Enables spousal RRSP and income splitting analysis"
            />
            <Input
              label="Number of children under 18"
              type="number"
              min={0}
              max={10}
              value={clientIntake.numberOfChildren || ""}
              onChange={(e) => handleField("numberOfChildren", parseInt(e.target.value) || 0)}
              hint="Determines RESP eligibility and CESG grant optimization"
            />
          </div>
        </FormSection>

        {/* Income & Tax */}
        <FormSection
          title="Income & Tax Profile"
          description="Used to calculate RRSP room and determine optimal account contribution sequence"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Annual Employment Income"
              type="number"
              min={0}
              prefix="$"
              value={clientIntake.annualIncome || ""}
              onChange={(e) => handleField("annualIncome", parseFloat(e.target.value) || 0)}
              error={errors.annualIncome}
              placeholder="85,000"
            />
            {clientIntake.hasSpouse && (
              <Input
                label="Spouse Annual Income"
                type="number"
                min={0}
                prefix="$"
                value={clientIntake.spouseIncome || ""}
                onChange={(e) => handleField("spouseIncome", parseFloat(e.target.value) || 0)}
                placeholder="65,000"
              />
            )}
            <div className="col-span-full sm:col-span-1">
              <Input
                label="Marginal Tax Rate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                suffix="%"
                value={taxRateDisplay || ""}
                onChange={(e) => {
                  if (clientIntake.taxRateOverride) {
                    handleField("marginalTaxRate", parseFloat(e.target.value) / 100);
                  }
                }}
                hint={
                  clientIntake.taxRateOverride
                    ? "Manually overridden"
                    : `Auto-calculated (federal + ${clientIntake.province} provincial)`
                }
                readOnly={!clientIntake.taxRateOverride}
                className={!clientIntake.taxRateOverride ? "opacity-70 cursor-default" : ""}
              />
              <div className="mt-2">
                <Toggle
                  checked={clientIntake.taxRateOverride}
                  onChange={(v) => {
                    if (!v) {
                      // Revert to auto-calculated when turning off override
                      const rate = calculateMarginalTaxRate(clientIntake.annualIncome, clientIntake.province);
                      setClientIntake({ taxRateOverride: false, marginalTaxRate: rate });
                    } else {
                      handleField("taxRateOverride", true);
                    }
                  }}
                  label="Override auto-calculated rate"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <Toggle
              checked={clientIntake.hasDBPension}
              onChange={(v) => handleField("hasDBPension", v)}
              label="Defined Benefit (DB) pension member"
              description="DB pension creates a Pension Adjustment that reduces RRSP room"
            />
            {clientIntake.hasDBPension && (
              <div className="ml-14">
                <Input
                  label="Pension Adjustment (PA)"
                  type="number"
                  min={0}
                  prefix="$"
                  value={clientIntake.pensionAdjustment || ""}
                  onChange={(e) => handleField("pensionAdjustment", parseFloat(e.target.value) || 0)}
                  hint="From T4 Box 52 — typically $8,000–$25,000/year"
                  placeholder="18,500"
                />
              </div>
            )}
          </div>
        </FormSection>

        {/* Account Snapshot */}
        <FormSection
          title="Registered Account Snapshot"
          description="Current balances and available contribution room"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="TFSA Available Room"
              type="number"
              min={0}
              prefix="$"
              value={clientIntake.tfsaRoom || ""}
              onChange={(e) => handleField("tfsaRoom", parseFloat(e.target.value) || 0)}
              hint="2024 annual limit: $7,000"
              placeholder="42,000"
            />
            <Input
              label="TFSA Current Balance"
              type="number"
              min={0}
              prefix="$"
              value={clientIntake.tfsaBalance || ""}
              onChange={(e) => handleField("tfsaBalance", parseFloat(e.target.value) || 0)}
              placeholder="15,000"
            />
            <Input
              label="RRSP Available Room"
              type="number"
              min={0}
              prefix="$"
              value={clientIntake.rrspRoom || ""}
              onChange={(e) => handleField("rrspRoom", parseFloat(e.target.value) || 0)}
              hint="2024 max: $31,560 (net of pension adjustment)"
              placeholder="18,000"
            />
            <Input
              label="RRSP Current Balance"
              type="number"
              min={0}
              prefix="$"
              value={clientIntake.rrspBalance || ""}
              onChange={(e) => handleField("rrspBalance", parseFloat(e.target.value) || 0)}
              placeholder="25,000"
            />

            <div className="col-span-full">
              <Toggle
                checked={clientIntake.fhsaEligible}
                onChange={(v) => handleField("fhsaEligible", v)}
                label="FHSA Eligible (first-time homebuyer, under 40)"
                description="$8,000/year, $40,000 lifetime max. Tax-deductible contributions + tax-free qualifying withdrawals."
                disabled={clientIntake.age >= 40}
              />
            </div>
            {clientIntake.fhsaEligible && (
              <>
                <Input
                  label="FHSA Available Room"
                  type="number"
                  min={0}
                  max={40000}
                  prefix="$"
                  value={clientIntake.fhsaRoom || ""}
                  onChange={(e) => handleField("fhsaRoom", parseFloat(e.target.value) || 0)}
                  hint="Max $8,000/year, $40,000 lifetime"
                  placeholder="8,000"
                />
                <Input
                  label="FHSA Current Balance"
                  type="number"
                  min={0}
                  prefix="$"
                  value={clientIntake.fhsaBalance || ""}
                  onChange={(e) => handleField("fhsaBalance", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </>
            )}

            {clientIntake.respEligible && (
              <div className="col-span-full">
                <Input
                  label="RESP Balance"
                  type="number"
                  min={0}
                  prefix="$"
                  value={clientIntake.respBalance || ""}
                  onChange={(e) => handleField("respBalance", parseFloat(e.target.value) || 0)}
                  hint="CESG: 20% grant on first $2,500/year = max $500/year federal grant"
                  placeholder="5,000"
                />
              </div>
            )}

            {clientIntake.hasSpouse && (
              <Input
                label="Spousal RRSP Balance"
                type="number"
                min={0}
                prefix="$"
                value={clientIntake.spousalRrspBalance || ""}
                onChange={(e) => handleField("spousalRrspBalance", parseFloat(e.target.value) || 0)}
                hint="Draws from your RRSP room — reduces tax in retirement via income splitting"
              />
            )}

            <Input
              label="Non-Registered Holdings"
              type="number"
              min={0}
              prefix="$"
              value={clientIntake.nonRegBalance || ""}
              onChange={(e) => handleField("nonRegBalance", parseFloat(e.target.value) || 0)}
              hint="Taxable investment accounts (triggers review if >$100k)"
              placeholder="0"
            />
          </div>
        </FormSection>

        {/* Goals */}
        <FormSection
          title="Goals & Planning Horizon"
          description="Client objectives and monthly savings capacity"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Financial Goal"
              value={clientIntake.primaryGoal}
              onChange={(e) => handleField("primaryGoal", e.target.value as GoalType)}
              options={goalOptions}
            />
            <Input
              label="Time Horizon"
              type="number"
              min={1}
              max={50}
              suffix="years"
              value={clientIntake.timeHorizonYears || ""}
              onChange={(e) => handleField("timeHorizonYears", parseInt(e.target.value) || 0)}
            />
            <Input
              label="Monthly Contribution Budget"
              type="number"
              min={0}
              prefix="$"
              value={clientIntake.monthlyContributionBudget || ""}
              onChange={(e) => handleField("monthlyContributionBudget", parseFloat(e.target.value) || 0)}
              error={errors.monthlyContributionBudget}
              hint={`$${((clientIntake.monthlyContributionBudget || 0) * 12).toLocaleString()}/year total`}
            />
            <Select
              label="Risk Tolerance"
              value={clientIntake.riskTolerance}
              onChange={(e) => handleField("riskTolerance", e.target.value as "conservative" | "moderate" | "aggressive")}
              options={riskOptions}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Additional Notes
            </label>
            <textarea
              value={clientIntake.additionalNotes}
              onChange={(e) => handleField("additionalNotes", e.target.value)}
              rows={3}
              placeholder="Relevant context: upcoming life events, existing commitments, cross-border concerns..."
              className="w-full bg-navy-700 border border-navy-500 hover:border-navy-400 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200 text-sm px-3 py-2 resize-none"
            />
          </div>
        </FormSection>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <p className="text-sm text-slate-500">
            Analysis powered by Claude · Typically takes 15–20 seconds
          </p>
          <Button type="submit" size="lg" className="min-w-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Analyze with AI
          </Button>
        </div>
      </form>

      {/* Tax Rate Info Bar */}
      {clientIntake.annualIncome > 0 && !clientIntake.taxRateOverride && (
        <div className="fixed bottom-4 right-4 bg-navy-800 border border-navy-500 rounded-xl px-4 py-3 text-sm flex items-center gap-3 shadow-xl animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-slate-400">Marginal rate:</span>
          <span className="font-semibold text-white">{formatTaxRate(clientIntake.marginalTaxRate)}</span>
          <span className="text-slate-500">({clientIntake.province})</span>
        </div>
      )}
    </PageContainer>
  );
}
