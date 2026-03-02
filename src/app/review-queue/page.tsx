"use client";

import { useState } from "react";
import { useWealthStore } from "@/store/wealth-store";
import { PageContainer } from "@/components/layout/PageContainer";
import { ReviewCaseCard } from "@/components/review/ReviewCaseCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ReviewQueuePage() {
  const { reviewCases, markCaseReviewed } = useWealthStore();
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("pending");

  const handleMarkReviewed = (id: string) => {
    markCaseReviewed(id);
  };

  const filteredCases = reviewCases.filter((c) => {
    if (filter === "pending") return !c.reviewed;
    if (filter === "reviewed") return c.reviewed;
    return true;
  });

  const pendingCount = reviewCases.filter((c) => !c.reviewed).length;
  const reviewedCount = reviewCases.filter((c) => c.reviewed).length;

  return (
    <PageContainer maxWidth="xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Review Queue</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Complex cases flagged for human advisor review
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-sm text-slate-400">
              <span className="text-white font-medium">{pendingCount}</span> pending
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm text-slate-400">
              <span className="text-white font-medium">{reviewedCount}</span> reviewed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-sm text-slate-400">
              <span className="text-white font-medium">{reviewCases.length}</span> total
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-navy-800 border border-navy-500 rounded-lg p-1 w-fit">
          {(["pending", "all", "reviewed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 capitalize flex items-center gap-2
                ${filter === f
                  ? "bg-navy-600 text-white"
                  : "text-slate-400 hover:text-white"
                }
              `}
            >
              {f}
              {f === "pending" && pendingCount > 0 && (
                <Badge variant="warning" size="sm">{pendingCount}</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cases */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-navy-800 border border-navy-500 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-500">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {filter === "pending" ? "No pending cases" : "No cases found"}
          </h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            {filter === "pending"
              ? "All flagged cases have been reviewed. Load a demo persona and analyze to generate new cases."
              : "Analyze client profiles with the New Client form to populate the queue."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCases.map((reviewCase) => (
            <ReviewCaseCard
              key={reviewCase.id}
              reviewCase={reviewCase}
              onMarkReviewed={handleMarkReviewed}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
