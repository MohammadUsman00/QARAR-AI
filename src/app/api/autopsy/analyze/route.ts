import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/profile";
import { generateAutopsy } from "@/lib/gemini";
import { getPlanLimits } from "@/lib/plan-limits";
import { NextResponse } from "next/server";

function parseRoughInr(text: string): number | null {
  const m = text.match(/₹\s*([\d,]+)/);
  if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  const lakhs = text.match(/([\d.]+)\s*lakh/i);
  if (lakhs) return Math.round(parseFloat(lakhs[1]) * 100000);
  return null;
}

function titleFromInput(raw: string) {
  const line = raw.trim().split("\n")[0]?.slice(0, 80) ?? "Untitled decision";
  return line.length < raw.trim().length ? `${line}…` : line;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserProfile(supabase, user.id, user.user_metadata?.full_name);

  const body = await request.json();
  const {
    raw_input,
    domain = "other",
    emotional_state,
    decision_date,
    outcome_rating,
  } = body as {
    raw_input?: string;
    domain?: string;
    emotional_state?: string;
    decision_date?: string;
    outcome_rating?: number;
  };

  if (!raw_input?.trim()) {
    return NextResponse.json({ error: "raw_input required" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan")
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

  const { data: pastDecisions } = await supabase
    .from("decisions")
    .select("title, raw_input, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: cognitiveRow } = await supabase
    .from("cognitive_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let ai;
  try {
    ai = await generateAutopsy(
      raw_input.trim(),
      domain,
      emotional_state ?? "unspecified",
      pastDecisions ?? [],
      cognitiveRow ?? null,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Autopsy failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { result, tokensApprox } = ai;
  const estimated_inr = parseRoughInr(result.estimated_cost_context);

  const title = titleFromInput(raw_input);

  const { data: decision, error: dErr } = await supabase
    .from("decisions")
    .insert({
      user_id: user.id,
      title,
      raw_input: raw_input.trim(),
      domain,
      emotional_state_before: emotional_state ?? null,
      outcome_rating: outcome_rating ?? null,
      decision_date: decision_date ?? null,
    })
    .select("id")
    .single();

  if (dErr || !decision) {
    return NextResponse.json(
      { error: dErr?.message ?? "Could not save decision" },
      { status: 500 },
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
      model_version: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      tokens_used: tokensApprox,
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
    .select("cognitive_biases, estimated_cost_inr")
    .eq("user_id", user.id);

  const biasCounts: Record<string, number> = {};
  let totalCost = 0;
  for (const row of allAutopsies ?? []) {
    const biases = row.cognitive_biases as { name?: string }[] | null;
    if (Array.isArray(biases)) {
      for (const b of biases) {
        if (b?.name) {
          biasCounts[b.name] = (biasCounts[b.name] ?? 0) + 1;
        }
      }
    }
    if (row.estimated_cost_inr != null) {
      totalCost += Number(row.estimated_cost_inr);
    }
  }

  const topBiases = Object.entries(biasCounts)
    .map(([bias, frequency]) => ({
      bias,
      frequency,
      percentage: Math.min(
        100,
        Math.round((frequency / Math.max(used + 1, 1)) * 100),
      ),
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8);

  const { error: upsertErr } = await supabase.from("cognitive_profiles").upsert(
    {
      user_id: user.id,
      top_biases: topBiases,
      total_decisions_analyzed: used + 1,
      estimated_total_cost_inr: totalCost,
      profile_confidence: Math.min(0.95, 0.25 + (used + 1) * 0.05),
      last_updated: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (upsertErr) {
    console.error("cognitive profile upsert", upsertErr);
  }

  return NextResponse.json({
    decision_id: decision.id,
    autopsy_id: autopsy.id,
    result,
  });
}
