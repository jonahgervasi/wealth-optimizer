import { NextRequest, NextResponse } from "next/server";
import {
  getAllReviewCases,
  getPendingCount,
  markReviewed,
} from "@/lib/review-store";

export async function GET() {
  const cases = getAllReviewCases();
  const pendingCount = getPendingCount();

  return NextResponse.json({
    cases,
    pendingCount,
    totalCount: cases.length,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updated = markReviewed(id);

    if (!updated) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      case: updated,
      pendingCount: getPendingCount(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    );
  }
}
