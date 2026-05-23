import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { PatternAlertsPanel } from "@/components/dashboard/pattern-alerts";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const BiasBarChart = dynamic(
  () =>
    import("@/components/charts/bias-bar-chart").then((m) => m.BiasBarChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const DomainRadarChart = dynamic(
  () =>
    import("@/components/charts/domain-radar-chart").then(
      (m) => m.DomainRadarChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const QualityLineChart = dynamic(
  () =>
    import("@/components/charts/quality-line-chart").then(
      (m) => m.QualityLineChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

function ChartSkeleton() {
  return (
    <div className="h-72 w-full animate-pulse rounded-lg bg-bg-tertiary/60" />
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("id", user!.id)
    .single();

  const { data: autopsies } = await supabase
    .from("autopsies")
    .select("id, decision_id, cognitive_biases, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const decisionIds = (autopsies ?? [])
    .map((a) => a.decision_id)
    .filter(Boolean) as string[];

  let decisionRows: { id: string; title: string; domain: string | null }[] = [];
  if (decisionIds.length) {
    const { data } = await supabase
      .from("decisions")
      .select("id, title, domain")
      .in("id", decisionIds);
    decisionRows = data ?? [];
  }

  const decisionMap = Object.fromEntries(decisionRows.map((d) => [d.id, d]));

  const { data: cog } = await supabase
    .from("cognitive_profiles")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  const { data: alerts } = await supabase
    .from("pattern_alerts")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const topBiases = (cog?.top_biases as { bias?: string; frequency?: number }[] | null) ?? [];
  const biasData = topBiases.slice(0, 5).map((b) => ({
    name: b.bias ?? "Bias",
    count: b.frequency ?? 1,
  }));

  const domainScores = (cog?.domain_scores as Record<string, number> | null) ?? {
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

  const totalDecisions = cog?.total_decisions_analyzed ?? 0;
  const estCost = Number(cog?.estimated_total_cost_inr ?? 0);

  const trendRows =
    (cog?.decision_quality_trend as { month: string; score: number }[] | null) ??
    [];
  const lineData = trendRows;
  const qualityScore =
    trendRows.length > 0 ? trendRows[trendRows.length - 1]!.score : null;
  const prevScore =
    trendRows.length > 1 ? trendRows[trendRows.length - 2]!.score : qualityScore;
  const trendUp =
    qualityScore != null && prevScore != null ? qualityScore >= prevScore : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Plan: ${profile?.plan ?? "free"} — your decision intelligence at a glance.`}
        action={
          <Button asChild>
            <Link href="/autopsy">New autopsy</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total decisions analyzed"
          value={String(totalDecisions)}
        />
        <Stat
          label="Patterns identified"
          value={String(topBiases.length)}
        />
        <Stat
          label="Est. pattern cost"
          value={
            estCost > 0
              ? `₹${(estCost / 100000).toFixed(1)}L`
              : "—"
          }
        />
        <Stat
          label="Decision quality"
          value={qualityScore != null ? `${qualityScore.toFixed(1)} / 10` : "—"}
          trend={trendUp === undefined ? undefined : trendUp ? "up" : "down"}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl text-text-primary">
            Recent autopsies
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/history">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(autopsies ?? []).length === 0 && (
            <Card className="border-dashed border-border-active md:col-span-3">
              <CardContent className="p-8 text-center text-sm text-text-secondary">
                No autopsies yet.{" "}
                <Link href="/autopsy" className="text-accent-primary hover:underline">
                  Run your first autopsy
                </Link>
                .
              </CardContent>
            </Card>
          )}
          {(autopsies ?? []).map((a) => {
            const d = decisionMap[a.decision_id as string];
            const biases = a.cognitive_biases as { name?: string }[] | null;
            const top = biases?.[0]?.name ?? "—";
            return (
              <Card key={a.id} className="border-border-subtle">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">
                    {d?.title ?? "Untitled"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-text-secondary">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-accent-primary">
                      {d?.domain ?? "—"}
                    </span>
                  </div>
                  <div>Top bias: {top}</div>
                  <div className="text-xs text-text-tertiary">
                    {new Date(a.created_at ?? "").toLocaleDateString()}
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/autopsy?decision=${a.decision_id}`}>
                      View full report
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cognitive bias frequency</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Domain scores</CardTitle>
          </CardHeader>
          <CardContent>
            <DomainRadarChart data={radarData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pattern alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <PatternAlertsPanel
            plan={profile?.plan ?? "free"}
            initialAlerts={(alerts ?? []).map((al) => ({
              id: al.id as string,
              message: (al.message as string) ?? "",
              created_at: (al.created_at as string) ?? "",
              read: Boolean(al.read),
              decision_id: (al.decision_id as string) ?? null,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly decision quality</CardTitle>
        </CardHeader>
        <CardContent>
          {lineData.length > 0 ? (
            <QualityLineChart data={lineData} />
          ) : (
            <p className="text-sm text-text-secondary">
              Rate outcomes on autopsies to build your quality trend over time.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: "up" | "down";
}) {
  return (
    <Card className="border-border-subtle">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wider text-text-tertiary">
          {label}
        </div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="font-heading text-2xl text-text-primary">{value}</div>
          {trend && (
            <span className="text-accent-success">
              {trend === "up" ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
