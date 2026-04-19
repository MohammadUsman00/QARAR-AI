import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { confirm } = body as { confirm?: boolean };
  if (!confirm) {
    return NextResponse.json({ error: "confirm required" }, { status: 400 });
  }

  const service = await createServiceRoleClient();
  const { error } = await service.from("decisions").delete().eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await service.from("cognitive_profiles").upsert(
    {
      user_id: user.id,
      top_biases: [],
      domain_scores: {},
      decision_quality_trend: [],
      total_decisions_analyzed: 0,
      estimated_total_cost_inr: 0,
      profile_confidence: 0.2,
      narrative_summary: null,
      last_updated: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  await service.from("pattern_alerts").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
