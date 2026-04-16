import { createClient } from "@/lib/supabase/server";
import { PatternsClient } from "@/components/patterns/patterns-client";
import { getPlanLimits } from "@/lib/plan-limits";

export default async function PatternsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("id", user!.id)
    .single();

  const plan = profile?.plan ?? "free";
  const limits = getPlanLimits(plan);

  const { data: cog } = await supabase
    .from("cognitive_profiles")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <PatternsClient
      locked={!limits.patterns_access}
      cognitive={cog}
      plan={plan}
    />
  );
}
