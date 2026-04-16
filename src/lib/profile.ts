import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureUserProfile(
  supabase: SupabaseClient,
  userId: string,
  fullName?: string | null,
) {
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return;

  await supabase.from("user_profiles").insert({
    id: userId,
    full_name: fullName ?? null,
    plan: "free",
    onboarding_completed: false,
  });
}
