"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWealthStore } from "@/store/wealth-store";

export function NavBar() {
  const pathname = usePathname();
  const reviewCases = useWealthStore((s) => s.reviewCases);
  const pendingReviewCount = reviewCases.filter((c) => !c.reviewed).length;

  return (
    <nav className="sticky top-0 z-50 bg-navy-800/95 backdrop-blur border-b border-navy-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-navy-900"
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-sm leading-none block">
                WealthOptimizer
              </span>
              <span className="text-accent text-xs leading-none font-medium">AI</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${pathname === "/"
                  ? "bg-navy-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-navy-700"
                }
              `}
            >
              New Client
            </Link>

            <Link
              href="/review-queue"
              className={`
                relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2
                ${pathname === "/review-queue"
                  ? "bg-navy-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-navy-700"
                }
              `}
            >
              Review Queue
              {pendingReviewCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-accent text-navy-900 text-xs font-bold">
                  {pendingReviewCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
