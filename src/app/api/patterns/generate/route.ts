import { createClient } from "@/lib/supabase/server";
import {
  PatternInferenceError,
  generateDecisionPortrait,
} from "@/lib/gemini-patterns";
import {
  createRequestId,
  logInferenceEvent,
} from "@/lib/inference-telemetry";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestId = createRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const aiRateLimit = await checkRateLimit({
    scope: "patterns-generate",
    key: rateLimitKey("patterns-generate", user.id, request),
    limit: 6,
    windowMs: 60 * 60 * 1000,
  });

  if (!aiRateLimit.allowed) {
    logInferenceEvent({
      requestId,
      route: "/api/patterns/generate",
      userId: user.id,
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      promptVersion: "not_started",
      schemaVersion: "not_started",
      status: "rate_limited",
    });

    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many pattern-generation requests. Please try again later.",
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

  const { data: cog } = await supabase
    .from("cognitive_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: recent } = await supabase
    .from("decisions")
    .select("title, domain, created_at, emotional_state_before")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  let out;
  try {
    out = await generateDecisionPortrait({
      cognitive: cog ?? null,
      recent_decisions: recent ?? [],
    });
  } catch (error) {
    const code =
      error instanceof PatternInferenceError
        ? error.code === "timeout"
          ? "timeout"
          : error.code === "safety_error"
            ? "validation_error"
            : "provider_error"
        : "provider_error";

    logInferenceEvent({
      requestId,
      route: "/api/patterns/generate",
      userId: user.id,
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      promptVersion: "unknown",
      schemaVersion: "unknown",
      status: code === "timeout" ? "timeout" : "provider_error",
      error: error instanceof Error ? error.message : "Pattern generation failed",
    });

    return NextResponse.json(
      {
        error: code,
        message: "Pattern generation failed. Please try again.",
        request_id: requestId,
      },
      { status: code === "timeout" ? 504 : 500 },
    );
  }

  await supabase.from("cognitive_profiles").upsert(
    {
      user_id: user.id,
      narrative_summary: out.narrative,
      last_updated: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  logInferenceEvent({
    requestId,
    route: "/api/patterns/generate",
    userId: user.id,
    model: out.modelVersion,
    promptVersion: out.promptVersion,
    schemaVersion: out.schemaVersion,
    status: "success",
    latencyMs: out.latencyMs,
    tokensApprox: out.tokensApprox,
  });

  return NextResponse.json({
    narrative: out.narrative,
    request_id: requestId,
  });
}
