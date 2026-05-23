"use client";

import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function google() {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  async function forgot() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (err) setError(err.message);
    else setInfo("If an account exists, a reset link has been sent.");
  }

  return (
    <AuthShell title="Sign in" subtitle="No theatrics. Access your autopsy history.">
      <form onSubmit={onSubmit} className="space-y-4">
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
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-accent-danger">{error}</p>}
        {info && <p className="text-sm text-accent-success">{info}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <Button type="button" variant="outline" className="mt-3 w-full" onClick={google}>
        Continue with Google
      </Button>
      <button
        type="button"
        onClick={forgot}
        className="mt-4 text-sm text-accent-primary hover:underline"
      >
        Forgot password
      </button>
      <p className="mt-8 text-sm text-text-secondary">
        New here?{" "}
        <Link href="/signup" className="text-accent-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
