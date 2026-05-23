import {
  buildDomainScores,
  buildMonthlyQualityTrend,
} from "@/lib/cognitive-aggregate";
import { normalizeBiasesInResult } from "@/lib/pipeline/bias-taxonomy";
import { buildPipelineContext } from "@/lib/pipeline/context";
import { embedText } from "@/lib/pipeline/embeddings";
import { buildEnrichedProfile } from "@/lib/pipeline/profile-enrichment";
import { buildDecisionSummary } from "@/lib/pipeline/summary";
import type {
  AutopsyRow,
  DecisionForAggregate,
  OnboardingAnswers,
  PastDecision,
  PipelineContext,
} from "@/lib/pipeline/types";
import { PIPELINE_VERSION } from "@/lib/pipeline/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AutopsyResult } from "@/lib/gemini";
import { generateAutopsy } from "@/lib/gemini";

export type PrepareContextInput = {
  rawInput: string;
  pastDecisions: PastDecision[];
  onboardingAnswers: OnboardingAnswers | null;
  existingHistorySummary: string | null;
};

export type RunAutopsyPipelineInput = PrepareContextInput & {
  domain: string;
  emotionalState: string;
  cognitiveProfile: Record<string, unknown> | null;
};

export type RunAutopsyPipelineOutput = {
  result: AutopsyResult;
  pipelineContext: PipelineContext;
  historySummary: string;
  tokensApprox: number;
  latencyMs: number;
  modelVersion: string;
  promptVersion: string;
  schemaVersion: string;
};

export async function preparePipelineContext(
  input: PrepareContextInput,
): Promise<PipelineContext> {
  const base = await buildPipelineContext(
    input.rawInput,
    input.pastDecisions,
    input.onboardingAnswers,
    input.existingHistorySummary,
  );

  const historySummary =
    buildDecisionSummary(input.pastDecisions, base.relevantDecisions) ??
    input.existingHistorySummary ??
    "";

  return {
    ...base,
    historySummary: historySummary || null,
  };
}

export async function runAutopsyPipeline(
  input: RunAutopsyPipelineInput,
): Promise<RunAutopsyPipelineOutput> {
  const ctx = await preparePipelineContext({
    rawInput: input.rawInput,
    pastDecisions: input.pastDecisions,
    onboardingAnswers: input.onboardingAnswers,
    existingHistorySummary: input.existingHistorySummary,
  });

  const ai = await generateAutopsy(
    input.rawInput,
    input.domain,
    input.emotionalState,
    input.pastDecisions,
    input.cognitiveProfile,
    {
      relevantDecisions: ctx.relevantDecisions,
      historySummary: ctx.historySummary,
      onboardingSnippet: ctx.onboardingSnippet,
      retrievalMethod: ctx.retrievalMethod,
      pipelineVersion: ctx.pipelineVersion,
    },
  );

  const normalized = normalizeBiasesInResult(ai.result.cognitive_biases);
  const result: AutopsyResult = {
    ...ai.result,
    cognitive_biases: normalized,
  };

  return {
    result,
    pipelineContext: ctx,
    historySummary: ctx.historySummary ?? "",
    tokensApprox: ai.tokensApprox,
    latencyMs: ai.latencyMs,
    modelVersion: ai.modelVersion,
    promptVersion: ai.promptVersion,
    schemaVersion: ai.schemaVersion,
  };
}

export async function embedDecisionNarrative(
  rawInput: string,
  title: string,
): Promise<number[] | null> {
  const text = `${title}\n${rawInput}`.trim();
  return embedText(text);
}

export type AggregateProfileInput = {
  autopsies: AutopsyRow[];
  decisions: DecisionForAggregate[];
  totalDecisions: number;
  feedbackHelpfulRate: number | null;
  historySummary: string;
};

export function buildCognitiveProfileUpdate(input: AggregateProfileInput) {
  const enriched = buildEnrichedProfile(
    input.autopsies,
    input.decisions,
    input.totalDecisions,
    input.feedbackHelpfulRate,
  );

  const domainScores = buildDomainScores(input.decisions);
  const decisionQualityTrend = buildMonthlyQualityTrend(input.decisions);

  let totalCost = 0;
  for (const row of input.autopsies) {
    if (row.estimated_cost_inr != null) {
      totalCost += Number(row.estimated_cost_inr);
    }
  }

  return {
    top_biases: enriched.top_biases,
    trigger_map: enriched.trigger_map,
    high_risk_states: enriched.high_risk_states,
    worst_decision_times: enriched.worst_decision_times,
    domain_scores: domainScores,
    decision_quality_trend: decisionQualityTrend,
    total_decisions_analyzed: input.totalDecisions,
    estimated_total_cost_inr: totalCost,
    profile_confidence: enriched.profile_confidence,
    history_summary: input.historySummary || null,
    pipeline_version: PIPELINE_VERSION,
    last_updated: new Date().toISOString(),
  };
}

export async function computeFeedbackHelpfulRate(
  supabase: SupabaseClient,
  userId: string,
): Promise<number | null> {
  const { data } = await supabase
    .from("autopsy_feedback")
    .select("helpful")
    .eq("user_id", userId);

  if (!data?.length) return null;
  const helpful = data.filter((r: { helpful: boolean }) => r.helpful).length;
  return helpful / data.length;
}
