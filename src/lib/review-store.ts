import type { ReviewCase } from "@/types/review";

// Attach to globalThis so the Map is shared across Next.js route module instances in dev mode.
// Without this, each API route gets its own module bundle and a separate empty Map.
declare global {
  // eslint-disable-next-line no-var
  var __reviewStore: Map<string, ReviewCase> | undefined;
}

function getStore(): Map<string, ReviewCase> {
  if (!globalThis.__reviewStore) {
    globalThis.__reviewStore = new Map<string, ReviewCase>();
  }
  return globalThis.__reviewStore;
}

export function addReviewCase(reviewCase: ReviewCase): void {
  getStore().set(reviewCase.id, reviewCase);
}

export function getAllReviewCases(): ReviewCase[] {
  return Array.from(getStore().values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPendingReviewCases(): ReviewCase[] {
  return getAllReviewCases().filter((c) => !c.reviewed);
}

export function markReviewed(id: string): ReviewCase | null {
  const store = getStore();
  const reviewCase = store.get(id);
  if (!reviewCase) return null;

  const updated = {
    ...reviewCase,
    reviewed: true,
    reviewedAt: new Date().toISOString(),
  };
  store.set(id, updated);
  return updated;
}

export function getReviewCaseById(id: string): ReviewCase | null {
  return getStore().get(id) ?? null;
}

export function getPendingCount(): number {
  return getPendingReviewCases().length;
}
