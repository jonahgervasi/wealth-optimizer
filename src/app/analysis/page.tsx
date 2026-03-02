"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWealthStore } from "@/store/wealth-store";
import { PageContainer } from "@/components/layout/PageContainer";
import { FinancialSnapshot } from "@/components/analysis/FinancialSnapshot";
import { AIRecommendation } from "@/components/analysis/AIRecommendation";
import { Button } from "@/components/ui/Button";
import type { AIAnalysisResult } from "@/types/analysis";
import type { ReviewCase } from "@/types/review";

const ANALYSIS_STEPS = [
  { label: "Reading client profile", duration: 2000 },
  { label: "Evaluating 2024 contribution room", duration: 3000 },
  { label: "Calculating marginal tax impact", duration: 3500 },
  { label: "Sequencing account priorities", duration: 3000 },
  { label: "Checking routing rules", duration: 2000 },
  { label: "Generating advisor brief", duration: 3000 },
  { label: "Finalizing recommendations", duration: 2000 },
];

function AnalysisLoader({ name }: { name: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [allStepsDone, setAllStepsDone] = useState(false);

  useEffect(() => {
    let step = 0;
    let elapsed = 0;
    const totalDuration = ANALYSIS_STEPS.reduce((s, x) => s + x.duration, 0);

    const tick = () => {
      if (step >= ANALYSIS_STEPS.length) return;

      const stepDuration = ANALYSIS_STEPS[step].duration;
      elapsed += stepDuration;

      const stepIndex = step;
      const elapsedSnapshot = elapsed;

      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, stepIndex]);
        setProgress(Math.min(95, Math.round((elapsedSnapshot / totalDuration) * 100)));
        if (stepIndex + 1 < ANALYSIS_STEPS.length) {
          setCurrentStep(stepIndex + 1);
        } else {
          setAllStepsDone(true);
        }
      }, elapsed);

      step++;
      tick();
    };

    tick();
  }, []);

  // Slowly creep from 95 → 99 while waiting for the API response
  useEffect(() => {
    if (!allStepsDone) return;
    const interval = setInterval(() => {
      setProgress((p) => (p < 99 ? p + 1 : 99));
    }, 4000);
    return () => clearInterval(interval);
  }, [allStepsDone]);

  return (
    <PageContainer maxWidth="sm">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Analyzing Portfolio</h2>
            <p className="text-slate-400 text-sm mt-1">
              {allStepsDone
                ? <>Claude is finalizing the response&hellip;</>                
                : <>Running analysis on {name}&apos;s financial profile</>}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-navy-600 rounded-full overflow-hidden">
              <div
                className={`h-full bg-accent rounded-full transition-all ease-out ${
                  allStepsDone ? "duration-[4000ms]" : "duration-700"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="bg-navy-800 border border-navy-500 rounded-xl p-5 space-y-3">
            {ANALYSIS_STEPS.map((step, i) => {
              const isDone = completedSteps.includes(i);
              const isActive = currentStep === i && !isDone;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-opacity duration-300 ${
                    i > currentStep && !isDone ? "opacity-30" : "opacity-100"
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {isDone ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : isActive ? (
                      <div className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-navy-500" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm transition-colors duration-200 ${
                      isDone
                        ? "text-slate-400 line-through"
                        : isActive
                        ? "text-white font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>

                  {isDone && (
                    <span className="ml-auto text-xs text-accent/60">done</span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-600 mt-4">
            {allStepsDone
              ? "Waiting for Claude\u2019s response \u2014 this can take up to 20 seconds"
              : "This typically takes 15\u201320 seconds"}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

export default function AnalysisPage() {
  const router = useRouter();
  const {
    clientIntake,
    analysisResult,
    isAnalyzing,
    setAnalysisResult,
    setIsAnalyzing,
    addReviewCase,
  } = useWealthStore();

  const hasIntakeData = clientIntake.firstName && clientIntake.lastName;
  const analysisStarted = useRef(false);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientIntake),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Analysis failed");
      }

      const raw = await response.json() as AIAnalysisResult & { reviewCase?: ReviewCase };
      const { reviewCase, ...result } = raw;
      setAnalysisResult(result as AIAnalysisResult);

      if (reviewCase) {
        addReviewCase(reviewCase);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [clientIntake, setAnalysisResult, setIsAnalyzing, addReviewCase]);

  useEffect(() => {
    if (!hasIntakeData) {
      router.replace("/");
      return;
    }
    if (!analysisResult && !analysisStarted.current) {
      analysisStarted.current = true;
      runAnalysis();
    }
  }, [hasIntakeData, analysisResult, router, runAnalysis]);

  if (!hasIntakeData) return null;

  if (isAnalyzing) {
    return <AnalysisLoader name={clientIntake.firstName} />;
  }

  if (!analysisResult) {
    return (
      <PageContainer maxWidth="sm">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-red-400">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Analysis Failed</h2>
          <p className="text-slate-400 max-w-sm">
            Something went wrong during analysis. Please check your API key and try again.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push("/")}>
              Edit Client Info
            </Button>
            <Button onClick={runAnalysis} loading={isAnalyzing}>
              Retry Analysis
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {clientIntake.firstName} {clientIntake.lastName} — Analysis
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            AI-generated registered account optimization strategy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/")} size="sm">
            ← Edit
          </Button>
          <Button variant="secondary" onClick={runAnalysis} size="sm">
            Re-analyze
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div>
          <FinancialSnapshot intake={clientIntake} />
        </div>
        <div>
          <AIRecommendation result={analysisResult} />
        </div>
      </div>
    </PageContainer>
  );
}
