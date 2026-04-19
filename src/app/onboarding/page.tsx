"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const regrets = [
  "Career change",
  "Relationship",
  "Financial investment",
  "Something I said",
  "Something I didn't say",
  "Hiring/firing",
  "A purchase",
  "Other",
];

const weaknesses = [
  "Acting too fast",
  "Acting too slow",
  "Trusting the wrong people",
  "Ignoring my gut",
  "Letting fear decide",
  "Letting others decide for me",
];

const brought = [
  "A specific decision I regret",
  "A pattern I keep repeating",
  "Curiosity about myself",
  "A friend recommended it",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedRegrets, setSelectedRegrets] = useState<string[]>([]);
  const [weakness, setWeakness] = useState<string | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const [firstStory, setFirstStory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.onboarding_completed) router.replace("/dashboard");
    });
  }, [router]);

  function toggleRegret(r: string) {
    setSelectedRegrets((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  }

  async function finish() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    await supabase
      .from("user_profiles")
      .update({
        onboarding_answers: {
          regrets: selectedRegrets,
          weakness,
          why,
        },
      })
      .eq("id", user.id);

    const res = await fetch("/api/autopsy/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_input: firstStory,
        domain: "other",
        emotional_state: "uncertain",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setLoading(false);
      alert(err.error ?? "Could not run autopsy. You can retry from /autopsy.");
      return;
    }

    const data = (await res.json()) as { decision_id?: string };

    await supabase
      .from("user_profiles")
      .update({
        onboarding_completed: true,
        full_name: user.user_metadata?.full_name ?? null,
      })
      .eq("id", user.id);

    setLoading(false);
    const q = data.decision_id ? `?decision=${data.decision_id}` : "";
    router.replace(`/autopsy${q}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-bg-tertiary">
          <motion.div
            className="h-full bg-accent-primary"
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="font-heading text-3xl text-text-primary">
              Let&apos;s calibrate your profile
            </h1>
            <p className="text-text-secondary">
              Which of these decisions have you regretted in the last 2 years?
            </p>
            <div className="flex flex-wrap gap-2">
              {regrets.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRegret(r)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors min-h-[44px]",
                    selectedRegrets.includes(r)
                      ? "border-accent-primary bg-bg-tertiary text-accent-primary"
                      : "border-border-subtle text-text-secondary hover:border-border-active",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button className="w-full" onClick={() => setStep(1)}>
              Continue
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="font-heading text-3xl text-text-primary">
              What&apos;s your biggest decision-making weakness?
            </h1>
            <div className="space-y-2">
              {weaknesses.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeakness(w)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-4 text-left text-sm transition-colors min-h-[44px]",
                    weakness === w
                      ? "border-accent-primary bg-bg-tertiary text-text-primary"
                      : "border-border-subtle text-text-secondary hover:border-border-active",
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!weakness}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="font-heading text-3xl text-text-primary">
              What brought you to Qarar?
            </h1>
            <div className="space-y-2">
              {brought.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setWhy(b)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-4 text-left text-sm transition-colors min-h-[44px]",
                    why === b
                      ? "border-accent-primary bg-bg-tertiary text-text-primary"
                      : "border-border-subtle text-text-secondary hover:border-border-active",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" disabled={!why} onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="font-heading text-3xl text-text-primary">
              Name your first autopsy
            </h1>
            <p className="text-text-secondary">
              Describe a decision you regret — anything, in your own words.
            </p>
            <textarea
              value={firstStory}
              onChange={(e) => setFirstStory(e.target.value)}
              rows={8}
              placeholder="I quit my job after one bad meeting with my manager..."
              className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            />
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={firstStory.trim().length < 20 || loading}
                onClick={finish}
              >
                {loading ? "Running autopsy…" : "Finish"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
