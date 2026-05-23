"use client";

import { RoyalCard } from "@/components/royal/royal-card";
import { RoyalCrest } from "@/components/royal/royal-crest";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

export function RoyalWelcome({
  name,
  plan,
  totalDecisions,
  profileConfidence,
  topBias,
  qualityScore,
}: {
  name: string;
  plan: string;
  totalDecisions: number;
  profileConfidence: number;
  topBias: string | null;
  qualityScore: number | null;
}) {
  const greeting = name ? `Welcome back, ${name.split(" ")[0]}` : "Welcome back";

  return (
    <RoyalCard glow className="overflow-visible">
      <div className="royal-card-inner relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent-royal/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-accent-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-bg-tertiary/60"
            >
              <RoyalCrest size={36} />
            </motion.div>
            <div>
              <p className="font-royal text-[10px] uppercase tracking-[0.3em] text-accent-primary">
                Royal intelligence suite · {plan}
              </p>
              <h2 className="mt-1 font-display text-2xl text-text-primary md:text-3xl">
                {greeting}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-text-secondary">
                {totalDecisions === 0
                  ? "Your cognitive throne awaits its first autopsy. One honest narrative unlocks your profile."
                  : topBias
                    ? `Your dominant pattern: ${topBias}. ${profileConfidence}% profile confidence.`
                    : `${totalDecisions} decisions dissected. Profile confidence ${profileConfidence}%.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
            <Button asChild size="lg" className="royal-btn-shine">
              <Link href="/autopsy">
                <Sparkles className="h-4 w-4" />
                New autopsy
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/patterns">View patterns</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          <InsightPill
            icon={Brain}
            label="Decisions analyzed"
            value={String(totalDecisions)}
          />
          <InsightPill
            icon={TrendingUp}
            label="Profile confidence"
            value={`${profileConfidence}%`}
          />
          <InsightPill
            icon={Sparkles}
            label="Decision quality"
            value={qualityScore != null ? `${qualityScore.toFixed(1)}/10` : "—"}
          />
        </div>
      </div>
    </RoyalCard>
  );
}

function InsightPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Brain;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle/80 bg-bg-primary/40 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-accent-royal/80">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="font-royal text-[9px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-1 font-display text-xl text-accent-secondary">{value}</div>
    </div>
  );
}
