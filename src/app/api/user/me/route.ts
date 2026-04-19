import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/plan-limits";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select(
      "plan, onboarding_completed, stripe_customer_id, notification_settings",
    )
    .eq("id", user.id)
    .single();

  const { count } = await supabase
    .from("decisions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const plan = profile?.plan ?? "free";
  const limits = getPlanLimits(plan);

  return NextResponse.json({
    plan,
    limits,
    decisionCount: count ?? 0,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    stripeCustomerId: profile?.stripe_customer_id ?? null,
    notificationSettings: profile?.notification_settings ?? null,
    email: user.email,
  });
}
