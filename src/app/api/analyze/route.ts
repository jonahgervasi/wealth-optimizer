import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "@/lib/anthropic";
import { systemPrompt, buildUserPrompt, analysisToolDefinition } from "@/lib/prompts";
import { evaluateRoutingRules } from "@/lib/routing-rules";
import { addReviewCase } from "@/lib/review-store";
import type { ClientIntake } from "@/types/client";
import type { AIAnalysisResult, AdvisorBrief } from "@/types/analysis";
import type { ReviewCase } from "@/types/review";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const intake: ClientIntake = await request.json();

    const client = getAnthropicClient();

    const tool: Anthropic.Tool = {
      name: analysisToolDefinition.name,
      description: analysisToolDefinition.description,
      input_schema: analysisToolDefinition.input_schema as Anthropic.Tool["input_schema"],
    };

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      tools: [tool],
      tool_choice: { type: "tool", name: "provide_analysis" },
      messages: [
        {
          role: "user",
          content: buildUserPrompt(intake),
        },
      ],
    });

    // Extract tool use result
    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return a tool use response");
    }

    const analysisResult = toolUse.input as AIAnalysisResult;

    // Run routing rules (override AI flagging if rules fire)
    const routingResult = evaluateRoutingRules(intake, analysisResult);

    const finalResult: AIAnalysisResult = {
      ...analysisResult,
      flaggedForReview: routingResult.shouldRoute || analysisResult.flaggedForReview,
      flagReasons: routingResult.shouldRoute
        ? routingResult.reasons
        : analysisResult.flagReasons,
    };

    // Write to review queue if flagged
    if (finalResult.flaggedForReview) {
      // Generate a fallback advisor brief if Claude didn't provide one
      // (happens when server-side routing rules flag a case Claude didn't flag itself)
      const advisorBrief: AdvisorBrief = finalResult.advisorBrief ?? {
        situationSummary: `${intake.firstName} ${intake.lastName}, age ${intake.age} in ${intake.province}, earning $${intake.annualIncome.toLocaleString()}/year. Primary goal: ${intake.primaryGoal.replace(/_/g, " ")}. This case was flagged by automated routing rules for advisor review.`,
        keyDecisionPoints: finalResult.flagReasons,
        recommendedQuestions: [
          "Review the flagged complexity factors and confirm they apply to this client's situation.",
          "Are there additional considerations not captured in the automated analysis?",
        ],
        suggestedNextSteps: [
          "Schedule a comprehensive review meeting with the client.",
          "Validate the AI-generated recommendations against the client's full financial picture.",
        ],
      };

      // Attach the brief to the result so the client sees it
      finalResult.advisorBrief = advisorBrief;

      const reviewCase: ReviewCase = {
        id: randomUUID(),
        clientIntake: intake,
        analysisResult: finalResult,
        advisorBrief,
        flagReasons: finalResult.flagReasons,
        createdAt: new Date().toISOString(),
        reviewed: false,
      };
      addReviewCase(reviewCase);
      return NextResponse.json({ ...finalResult, reviewCase });
    }

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
