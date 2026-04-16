"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const BiasBarChart = dynamic(
  () =>
    import("@/components/charts/bias-bar-chart").then((m) => m.BiasBarChart),
  { ssr: false },
);
const DomainRadarChart = dynamic(
  () =>
    import("@/components/charts/domain-radar-chart").then(
      (m) => m.DomainRadarChart,
    ),
  { ssr: false },
);

export function PatternsClient({
  locked,
  cognitive,
  plan,
}: {
  locked: boolean;
  cognitive: Record<string, unknown> | null;
  plan: string;
}) {
  const [narrative, setNarrative] = useState<string | null>(
    (cognitive?.narrative_summary as string | undefined) ?? null,
  );
  const [loading, setLoading] = useState(false);

  async function regenerate() {
    setLoading(true);
    const res = await fetch("/api/patterns/generate", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok && json.narrative) setNarrative(json.narrative as string);
  }
  const top = (cognitive?.top_biases as { bias?: string; frequency?: number }[] | undefined) ?? [];
  const biasData = top.slice(0, 5).map((b) => ({
    name: b.bias ?? "—",
    count: b.frequency ?? 1,
  }));

  const domainScores = (cognitive?.domain_scores as Record<string, number> | null) ?? {
    Career: 6,
    Relationships: 5,
    Money: 6,
    Health: 7,
    Social: 5,
    Personal: 6,
  };

  const radarData = Object.entries(domainScores).map(([domain, score]) => ({
    domain: domain.slice(0, 3),
    score,
  }));

  const confidence = Math.round((Number(cognitive?.profile_confidence ?? 0.4) || 0.4) * 100);
  const total = Number(cognitive?.total_decisions_analyzed ?? 0);

  return (
    <div className="relative space-y-8">
      {locked && (
        <div className="rounded-2xl border border-border-active bg-bg-secondary/70 p-6 text-center">
          <div className="font-heading text-xl text-text-primary">
            Pattern intelligence is a Pro feature
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            You&apos;re on <span className="text-accent-primary">{plan}</span>. Upgrade to unlock full
            pattern maps, exports, and narrative portraits.
          </p>
          <Button asChild className="mt-4">
            <Link href="/upgrade">View upgrade options</Link>
          </Button>
        </div>
      )}

      <div className={locked ? "pointer-events-none select-none blur-sm" : ""}>
        <div>
          <h1 className="font-heading text-3xl text-text-primary">My Patterns</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Profile confidence:{" "}
            <span className="text-accent-primary">{confidence}%</span> — based on{" "}
            <span className="text-text-primary">{total}</span> analyzed decisions.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Top cognitive biases</CardTitle>
              </CardHeader>
              <CardContent>
                {biasData.length ? (
                  <BiasBarChart data={biasData} />
                ) : (
                  <p className="text-sm text-text-secondary">Not enough data yet.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Domain radar</CardTitle>
              </CardHeader>
              <CardContent>
                <DomainRadarChart data={radarData} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI narrative summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p className="whitespace-pre-wrap text-text-primary">
              {narrative ??
                "Generate a monthly portrait after more autopsies."}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || locked}
              onClick={regenerate}
            >
              {loading ? "Generating…" : "Regenerate portrait"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trigger map (illustrative)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {["Authority conflict", "Sleep debt", "Reputation threat"].map((t, i) => (
              <div
                key={t}
                className="rounded-xl border border-border-subtle bg-bg-tertiary/40 p-4 text-sm"
                style={{ opacity: 0.4 + i * 0.2 }}
              >
                <div className="text-xs text-text-tertiary">Situation</div>
                <div className="mt-1 text-text-primary">{t}</div>
                <div className="mt-3 text-xs text-text-tertiary">→ Response</div>
                <div className="text-text-secondary">Impulsive exit</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
