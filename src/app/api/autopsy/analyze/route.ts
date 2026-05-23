import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/profile";
import { GeminiInferenceError } from "@/lib/gemini";
import { getPlanLimits } from "@/lib/plan-limits";
import { parseRoughInr, titleFromInput } from "@/lib/autopsy";
import {
  autopsyAnalyzeRequestSchema,
  formatZodError,
} from "@/lib/api-validation";
import { createRequestId, logInferenceEvent } from "@/lib/inference-telemetry";
import {
  assertSafeAutopsyOutput,
  detectCrisisInput,
  safetyDisclaimer,
} from "@/lib/llm-safety";
import {
  buildCognitiveProfileUpdate,
  computeFeedbackHelpfulRate,
  embedDecisionNarrative,
  runAutopsyPipeline,
} from "@/lib/pipeline/orchestrator";
import type { OnboardingAnswers, PastDecision } from "@/lib/pipeline/types";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const requestId = createRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserProfile(supabase, user.id, user.user_metadata?.full_name);

  const aiRateLimit = await checkRateLimit({
    scope: "autopsy-analyze",
    key: rateLimitKey("autopsy-analyze", user.id, request),
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!aiRateLimit.allowed) {
    logInferenceEvent({
      requestId,
      route: "/api/autopsy/analyze",
      userId: user.id,
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      promptVersion: "not_started",
      schemaVersion: "not_started",
      status: "rate_limited",
    });

    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many autopsy requests. Please try again later.",
        request_id: requestId,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(aiRateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(aiRateLimit.limit),
          "X-RateLimit-Remaining": String(aiRateLimit.remaining),
          "X-RateLimit-Reset": new Date(aiRateLimit.resetAt).toISOString(),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", request_id: requestId },
      { status: 400 },
    );
  }

  let input;
  try {
    input = autopsyAnalyzeRequestSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logInferenceEvent({
        requestId,
        route: "/api/autopsy/analyze",
        userId: user.id,
        model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
        promptVersion: "not_started",
        schemaVersion: "request-schema-v1",
        status: "validation_error",
        error: JSON.stringify(formatZodError(error)),
      });

      return NextResponse.json(
        {
          error: "validation_error",
          details: formatZodError(error),
          request_id: requestId,
        },
        { status: 400 },
      );
    }

    throw error;
  }

  const crisis = detectCrisisInput(input.raw_input);
  if (crisis.detected) {
    logInferenceEvent({
      requestId,
      route: "/api/autopsy/analyze",
      userId: user.id,
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      promptVersion: "not_started",
      schemaVersion: "request-schema-v1",
      status: "validation_error",
      error: "crisis_detected",
    });

    return NextResponse.json(
      {
        error: "crisis_detected",
        message: crisis.message,
        request_id: requestId,
        safety_disclaimer: safetyDisclaimer(),
      },
      { status: 422 },
    );
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan, onboarding_answers")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan ?? "free";
  const limits = getPlanLimits(plan);

  const { count } = await supabase
    .from("decisions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const used = count ?? 0;
  if (
    limits.autopsies_lifetime !== Number.POSITIVE_INFINITY &&
    used >= limits.autopsies_lifetime
  ) {
    return NextResponse.json(
      { error: "limit_reached", message: "Upgrade to continue." },
      { status: 403 },
    );
  }

  const { data: pastRows } = await supabase
    .from("decisions")
    .select("id, title, raw_input, domain, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const decisionIds = (pastRows ?? []).map((d) => d.id).filter(Boolean);
  const embeddingMap = new Map<string, number[]>();

  if (decisionIds.length > 0) {
    const { data: embRows } = await supabase
      .from("decision_embeddings")
      .select("decision_id, embedding")
      .eq("user_id", user.id)
      .in("decision_id", decisionIds);

    for (const row of embRows ?? []) {
      const vec = row.embedding as number[] | null;
      if (Array.isArray(vec) && vec.length > 0) {
        embeddingMap.set(row.decision_id as string, vec);
      }
    }
  }

  const pastDecisions: PastDecision[] = (pastRows ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    raw_input: d.raw_input,
    domain: d.domain,
    created_at: d.created_at,
    embedding: embeddingMap.get(d.id) ?? null,
  }));

  const { data: cognitiveRow } = await supabase
    .from("cognitive_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const onboardingAnswers = (profile?.onboarding_answers ??
    null) as OnboardingAnswers | null;
  const existingSummary =
    (cognitiveRow?.history_summary as string | undefined) ?? null;

  let pipelineOut;
  try {
    pipelineOut = await runAutopsyPipeline({
      rawInput: input.raw_input,
      domain: input.domain,
      emotionalState: input.emotional_state,
      pastDecisions,
      onboardingAnswers,
      existingHistorySummary: existingSummary,
      cognitiveProfile: cognitiveRow ?? null,
    });
    assertSafeAutopsyOutput(pipelineOut.result);
  } catch (e) {
    const code = e instanceof GeminiInferenceError ? e.code : "provider_error";
    const msg = e instanceof Error ? e.message : "Autopsy failed";
    logInferenceEvent({
      requestId,
      route: "/api/autopsy/analyze",
      userId: user.id,
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      promptVersion: "unknown",
      schemaVersion: "unknown",
      status: code,
      error: msg,
    });

    return NextResponse.json(
      {
        error: code,
        message: "Autopsy generation failed. Please try again.",
        request_id: requestId,
      },
      { status: code === "timeout" ? 504 : 500 },
    );
  }

  const {
    result,
    pipelineContext,
    historySummary,
    tokensApprox,
    latencyMs,
    modelVersion,
    promptVersion,
    schemaVersion,
  } = pipelineOut;

  const estimated_inr = parseRoughInr(result.estimated_cost_context);
  const title = titleFromInput(input.raw_input);

  const { data: decision, error: dErr } = await supabase
    .from("decisions")
    .insert({
      user_id: user.id,
      title,
      raw_input: input.raw_input,
      domain: input.domain,
      emotional_state_before: input.emotional_state,
      outcome_rating: input.outcome_rating ?? null,
      decision_date: input.decision_date ?? null,
    })
    .select("id")
    .single();

  if (dErr || !decision) {
    return NextResponse.json(
      { error: dErr?.message ?? "Could not save decision" },
      { status: 500 },
    );
  }

  const embedding = await embedDecisionNarrative(input.raw_input, title);
  if (embedding) {
    await supabase.from("decision_embeddings").upsert(
      {
        decision_id: decision.id,
        user_id: user.id,
        embedding,
        model_version: "text-embedding-004",
      },
      { onConflict: "decision_id" },
    );
  }

  const { data: autopsy, error: aErr } = await supabase
    .from("autopsies")
    .insert({
      decision_id: decision.id,
      user_id: user.id,
      root_cause: result.root_cause,
      cognitive_biases: result.cognitive_biases,
      emotional_triggers: result.emotional_triggers,
      life_patterns: result.life_patterns,
      nervous_system_state: result.nervous_system_state,
      alternate_outcome_probability: result.alternate_outcome_probability,
      wait_72hr_probability: result.wait_72hr_probability,
      estimated_cost_inr: estimated_inr,
      estimated_cost_context: result.estimated_cost_context,
      immediate_actions: result.immediate_actions,
      pattern_break_strategy: result.pattern_break_strategy,
      full_report: result.full_report_markdown,
      model_version: modelVersion,
      tokens_used: tokensApprox,
      prompt_version: promptVersion,
      schema_version: schemaVersion,
      request_id: requestId,
      latency_ms: latencyMs,
      pipeline_version: pipelineContext.pipelineVersion,
      retrieval_method: pipelineContext.retrievalMethod,
    })
    .select("id")
    .single();

  if (aErr || !autopsy) {
    return NextResponse.json(
      { error: aErr?.message ?? "Could not save autopsy" },
      { status: 500 },
    );
  }

  const { data: allAutopsies } = await supabase
    .from("autopsies")
    .select(
      "cognitive_biases, emotional_triggers, estimated_cost_inr, created_at",
    )
    .eq("user_id", user.id);

  const { data: allDecisions } = await supabase
    .from("decisions")
    .select("domain, outcome_rating, created_at, emotional_state_before")
    .eq("user_id", user.id);

  const feedbackRate = await computeFeedbackHelpfulRate(supabase, user.id);
  const totalDecisions = used + 1;

  const profileUpdate = buildCognitiveProfileUpdate({
    autopsies: allAutopsies ?? [],
    decisions: allDecisions ?? [],
    totalDecisions,
    feedbackHelpfulRate: feedbackRate,
    historySummary,
  });

  const biasCounts: Record<string, number> = {};
  for (const row of allAutopsies ?? []) {
    const biases = row.cognitive_biases as { name?: string }[] | null;
    if (Array.isArray(biases)) {
      for (const b of biases) {
        if (b?.name) {
          biasCounts[b.name] = (biasCounts[b.name] ?? 0) + 1;
        }
      }
    }
  }

  const { error: upsertErr } = await supabase
    .from("cognitive_profiles")
    .upsert(
      {
        user_id: user.id,
        ...profileUpdate,
      },
      { onConflict: "user_id" },
    );

  if (upsertErr) {
    console.error("cognitive profile upsert", upsertErr);
  }

  logInferenceEvent({
    requestId,
    route: "/api/autopsy/analyze",
    userId: user.id,
    model: modelVersion,
    promptVersion,
    schemaVersion,
    status: "success",
    latencyMs,
    tokensApprox,
  });

  if (plan === "elite") {
    for (const bias of result.cognitive_biases) {
      const freq = biasCounts[bias.name] ?? 0;
      if (freq >= 2) {
        await supabase.from("pattern_alerts").insert({
          user_id: user.id,
          alert_type: "pattern_match",
          message: `Pattern alert: "${bias.name}" has appeared ${freq} times across your autopsies.`,
          decision_id: decision.id,
          read: false,
        });
        break;
      }
    }
  }

  return NextResponse.json({
    decision_id: decision.id,
    autopsy_id: autopsy.id,
    result,
    request_id: requestId,
    safety_disclaimer: safetyDisclaimer(),
    pipeline: {
      version: pipelineContext.pipelineVersion,
      retrieval_method: pipelineContext.retrievalMethod,
      relevant_decisions_count: pipelineContext.relevantDecisions.length,
    },
  });
}
