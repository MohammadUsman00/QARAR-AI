import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/profile";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureUserProfile(supabase, user.id, user.user_metadata?.full_name);

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      userEmail={user.email ?? "account"}
      plan={profile?.plan ?? "free"}
    >
      {children}
    </AppShell>
  );
}
