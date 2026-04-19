const DOMAIN_KEYS = [
  "career",
  "relationship",
  "financial",
  "health",
  "social",
  "other",
] as const;

export type DecisionRow = {
  domain: string | null;
  outcome_rating: number | null;
  created_at: string;
};

/** Map domain → score 1–10 from average outcome_rating (higher outcome = better). */
export function buildDomainScores(decisions: DecisionRow[]): Record<string, number> {
  const buckets: Record<string, number[]> = {};
  for (const k of DOMAIN_KEYS) buckets[k] = [];

  for (const d of decisions) {
    const dom = (d.domain ?? "other").toLowerCase();
    const key = DOMAIN_KEYS.includes(dom as (typeof DOMAIN_KEYS)[number])
      ? dom
      : "other";
    if (d.outcome_rating != null && d.outcome_rating >= 1 && d.outcome_rating <= 10) {
      buckets[key].push(d.outcome_rating);
    }
  }

  const out: Record<string, number> = {};
  for (const k of DOMAIN_KEYS) {
    const arr = buckets[k];
    if (!arr.length) {
      out[k] = 5;
      continue;
    }
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    out[k] = Math.round(avg * 10) / 10;
  }
  return out;
}

/** Last 12 months rolling, monthly average decision quality (outcome_rating). */
export function buildMonthlyQualityTrend(decisions: DecisionRow[]): {
  month: string;
  score: number;
}[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-IN", { month: "short" });
    months.push({ key, label });
  }

  return months.map(({ key, label }) => {
    const ratings = decisions
      .filter((dec) => {
        const d = new Date(dec.created_at);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return k === key;
      })
      .map((dec) => dec.outcome_rating)
      .filter((r): r is number => r != null && r >= 1 && r <= 10);
    const score =
      ratings.length === 0
        ? 5
        : Math.round(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
          ) / 10;
    return { month: label, score };
  });
}
