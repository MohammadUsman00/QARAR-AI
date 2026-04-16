"use client";

import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("decisions")
        .select("id, title, domain, created_at, outcome_rating")
        .eq("user_id", user.id)
        .order("created_at", { ascending: sort === "old" });
      setRows((data as Row[]) ?? []);
    });
  }, [sort]);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (domain === "all" ? true : r.domain === domain))
      .filter((r) =>
        q.trim() ? r.title.toLowerCase().includes(q.toLowerCase()) : true,
      );
  }, [rows, domain, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-text-primary">History</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Every autopsy you&apos;ve run, searchable and filterable.
        </p>
      </div>

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
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "new" | "old")}
              className="rounded-md border border-border-subtle bg-bg-tertiary px-3 py-2 text-sm text-text-primary"
            >
              <option value="new">Newest</option>
              <option value="old">Oldest</option>
            </select>
          </div>
        </div>
        <Input
          placeholder="Search titles..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
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
        {filtered.map((r, i) => (
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
