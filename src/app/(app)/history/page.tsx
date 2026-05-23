"use client";

import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPlanLimits } from "@/lib/plan-limits";

type Row = {
  id: string;
  title: string;
  domain: string | null;
  created_at: string;
  outcome_rating: number | null;
};

export default function HistoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [domain, setDomain] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      setUserPlan(prof?.plan ?? "free");
      const { data } = await supabase
        .from("decisions")
        .select("id, title, domain, created_at, outcome_rating")
        .eq("user_id", user.id)
        .order("created_at", { ascending: sort === "old" });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    });
  }, [sort]);

  const filtered = useMemo(() => {
    const limits = getPlanLimits(userPlan);
    const historyDays = limits.history_days;
    let list = rows;
    if (historyDays !== Number.POSITIVE_INFINITY) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - historyDays);
      list = list.filter((r) => new Date(r.created_at) >= cutoff);
    }
    return list
      .filter((r) => (domain === "all" ? true : r.domain === domain))
      .filter((r) =>
        q.trim() ? r.title.toLowerCase().includes(q.toLowerCase()) : true,
      );
  }, [rows, domain, q, userPlan]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description={
          userPlan === "free"
            ? `Last ${getPlanLimits("free").history_days} days on Free. Upgrade for full history.`
            : "Every autopsy you've run, searchable and filterable."
        }
      />

      <div className="sticky top-0 z-10 space-y-3 border-b border-border-subtle bg-bg-primary/90 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {["all", "career", "relationship", "financial", "health"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDomain(d)}
                className={`rounded-full border px-3 py-1 text-xs capitalize min-h-[36px] ${
                  domain === d
                    ? "border-accent-primary text-accent-primary"
                    : "border-border-subtle text-text-secondary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as "new" | "old")}
              className="w-auto min-w-[120px]"
            >
              <option value="new">Newest</option>
              <option value="old">Oldest</option>
            </Select>
          </div>
        </div>
        <Input
          placeholder="Search titles..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-bg-tertiary/50" />
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <Card className="border-dashed border-border-active">
            <CardContent className="p-10 text-center text-sm text-text-secondary">
              Your first autopsy is waiting.{" "}
              <Link href="/autopsy" className="text-accent-primary hover:underline">
                Start now
              </Link>
              .
            </CardContent>
          </Card>
        )}
        {!loading &&
          filtered.map((r, i) => (
          <Card
            key={r.id}
            className="border-border-subtle"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-heading text-lg text-text-primary">{r.title}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-tertiary">
                  <Badge variant="muted">{r.domain ?? "—"}</Badge>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  {r.outcome_rating != null && (
                    <span>Outcome: {r.outcome_rating}/10</span>
                  )}
                </div>
              </div>
              <Link
                href={`/autopsy?decision=${r.id}`}
                className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-accent-primary hover:border-border-active"
              >
                Open report
              </Link>
            </CardContent>
          </Card>
          ))}
      </div>
    </div>
  );
}
