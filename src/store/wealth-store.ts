"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ClientIntake } from "@/types/client";
import type { AIAnalysisResult } from "@/types/analysis";
import type { ReviewCase } from "@/types/review";
import { defaultClientIntake } from "@/types/client";

interface WealthStore {
  clientIntake: ClientIntake;
  analysisResult: AIAnalysisResult | null;
  isAnalyzing: boolean;
  reviewCases: ReviewCase[];
  setClientIntake: (intake: Partial<ClientIntake>) => void;
  setAnalysisResult: (result: AIAnalysisResult | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  addReviewCase: (reviewCase: ReviewCase) => void;
  markCaseReviewed: (id: string) => void;
  resetIntake: () => void;
}

export const useWealthStore = create<WealthStore>()(
  persist(
    (set) => ({
      clientIntake: defaultClientIntake,
      analysisResult: null,
      isAnalyzing: false,
      reviewCases: [],

      setClientIntake: (intake) =>
        set((state) => ({
          clientIntake: { ...state.clientIntake, ...intake },
        })),

      setAnalysisResult: (result) => set({ analysisResult: result }),

      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

      addReviewCase: (reviewCase) =>
        set((state) => {
          // Idempotent — skip if already present
          if (state.reviewCases.some((c) => c.id === reviewCase.id)) {
            return state;
          }
          return { reviewCases: [reviewCase, ...state.reviewCases] };
        }),

      markCaseReviewed: (id) =>
        set((state) => ({
          reviewCases: state.reviewCases.map((c) =>
            c.id === id
              ? { ...c, reviewed: true, reviewedAt: new Date().toISOString() }
              : c
          ),
        })),

      resetIntake: () =>
        set({ clientIntake: defaultClientIntake, analysisResult: null }),
    }),
    {
      name: "wealth-optimizer-store",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          if (typeof window !== "undefined") {
            localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(name);
          }
        },
      },
    }
  )
);
