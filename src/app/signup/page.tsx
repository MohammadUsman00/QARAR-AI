"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function strengthLabel(score: number) {
  if (score < 2) return "Weak";
  if (score < 4) return "Fair";
  return "Strong";
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[^A-Za-z0-9]/.test(password)) s += 1;
    return s;
  }, [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.replace("/onboarding");
    router.refresh();
  }

  async function google() {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/onboarding")}`,
      },
    });
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-bg-primary p-10 md:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(107,140,255,0.15),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(200,169,81,0.12),_transparent_50%)]" />
        <div className="relative z-10 font-display text-2xl italic text-accent-primary">
          Qarar — قرار
        </div>
        <p className="relative z-10 max-w-sm text-sm text-text-secondary">
          Your first three autopsies are free. Bring one decision you regret — we&apos;ll dissect it
          without judgment.
        </p>
      </div>
      <div className="flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-heading text-3xl text-text-primary">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Calibrate your profile in the next step.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs text-text-secondary">Full name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                autoComplete="new-password"
              />
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
                <div
                  className="h-full bg-accent-primary transition-all duration-300"
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-text-tertiary">
                Strength: {strengthLabel(strength)} ({strength}/4 signals)
              </p>
            </div>
            {error && <p className="text-sm text-accent-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Continue"}
            </Button>
          </form>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={google}
          >
            Continue with Google
          </Button>
          <p className="mt-8 text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
