"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { apiErrorMessage } from "@/lib/api-errors";

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

type TriggerEntry = { trigger: string; pattern: string; count: number };
type RiskState = { state: string; count: number };
type WorstTime = { hour_bucket: string; count: number };

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
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/patterns/generate", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok && json.narrative) {
      setNarrative(json.narrative as string);
      return;
    }
    setError(apiErrorMessage(json, res.status));
  }

  const top =
    (cognitive?.top_biases as { bias?: string; frequency?: number }[] | undefined) ?? [];
  const biasData = top.slice(0, 5).map((b) => ({
    name: b.bias ?? "—",
    count: b.frequency ?? 1,
  }));

  const domainScores = (cognitive?.domain_scores as Record<string, number> | null) ?? {
    career: 5,
    relationship: 5,
    financial: 5,
    health: 5,
    social: 5,
    other: 5,
  };

  const radarData = Object.entries(domainScores).map(([domain, score]) => ({
    domain: domain.slice(0, 3),
    score,
  }));

  const triggerMap = (cognitive?.trigger_map as TriggerEntry[] | undefined) ?? [];
  const highRiskStates = (cognitive?.high_risk_states as RiskState[] | undefined) ?? [];
  const worstTimes = (cognitive?.worst_decision_times as WorstTime[] | undefined) ?? [];
  const historySummary = (cognitive?.history_summary as string | undefined) ?? null;

  const confidence = Math.round((Number(cognitive?.profile_confidence ?? 0.4) || 0.4) * 100);
  const total = Number(cognitive?.total_decisions_analyzed ?? 0);

  return (
    <div className="relative space-y-8">
      {locked && (
        <div className="qarar-surface p-6 text-center">
          <div className="font-heading text-xl text-text-primary">
            Pattern intelligence is a Pro feature
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            You&apos;re on <span className="text-accent-primary">{plan}</span>. Upgrade to unlock
            full pattern maps, exports, and narrative portraits.
          </p>
          <Button asChild className="mt-4">
            <Link href="/upgrade">View upgrade options</Link>
          </Button>
        </div>
      )}

      <div className={locked ? "pointer-events-none select-none blur-sm" : ""}>
        <PageHeader
          title="My Patterns"
          description={`Profile confidence ${confidence}% — based on ${total} analyzed decisions.`}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/autopsy">New autopsy</Link>
            </Button>
          }
        />

        {historySummary && (
          <Card className="border-border-subtle">
            <CardHeader>
              <CardTitle>History snapshot</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
              {historySummary}
            </CardContent>
          </Card>
        )}

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
                  <p className="text-sm text-text-secondary">
                    Complete a few autopsies to populate this chart.
                  </p>
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
                <CardTitle>Domain scores</CardTitle>
              </CardHeader>
              <CardContent>
                <DomainRadarChart data={radarData} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Decision portrait</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p className="whitespace-pre-wrap text-text-primary">
              {narrative ?? "Generate your AI narrative portrait from accumulated autopsies."}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || locked}
              onClick={regenerate}
            >
              {loading ? "Generating…" : "Regenerate portrait"}
            </Button>
            {error && <p className="text-xs text-accent-danger">{error}</p>}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Trigger map</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {triggerMap.length === 0 && (
                <p className="text-sm text-text-secondary">
                  Emotional triggers appear after more autopsies.
                </p>
              )}
              {triggerMap.slice(0, 6).map((t) => (
                <div
                  key={`${t.trigger}-${t.pattern}`}
                  className="rounded-lg border border-border-subtle bg-bg-tertiary/40 p-3 text-sm"
                >
                  <div className="font-medium text-text-primary">{t.trigger}</div>
                  <div className="mt-1 text-xs text-text-secondary">{t.pattern}</div>
                  <div className="mt-2 font-mono text-[10px] uppercase text-accent-primary">
                    {t.count}× observed
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>High-risk emotional states</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {highRiskStates.length === 0 && (
                <p className="text-text-secondary">
                  States linked to low outcomes (≤4/10) will surface here.
                </p>
              )}
              {highRiskStates.map((s) => (
                <div
                  key={s.state}
                  className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2"
                >
                  <span className="text-text-primary">{s.state}</span>
                  <span className="font-mono text-xs text-accent-danger">{s.count}×</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Worst decision times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {worstTimes.length === 0 && (
                <p className="text-text-secondary">
                  Time-of-day patterns appear when you rate low outcomes.
                </p>
              )}
              {worstTimes.map((w) => (
                <div
                  key={w.hour_bucket}
                  className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2"
                >
                  <span className="text-text-primary">{w.hour_bucket}</span>
                  <span className="font-mono text-xs text-accent-neural">{w.count}×</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
