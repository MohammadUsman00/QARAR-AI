import type { PastDecision } from "@/lib/pipeline/types";

const MAX_SUMMARY_CHARS = 2000;

/**
 * Deterministic rolling summary of decision history for prompt context.
 */
export function buildDecisionSummary(
  decisions: PastDecision[],
  relevant: PastDecision[],
): string | null {
  if (decisions.length === 0) return null;

  const byDomain: Record<string, number> = {};
  for (const d of decisions) {
    const dom = (d.domain ?? "other").toLowerCase();
    byDomain[dom] = (byDomain[dom] ?? 0) + 1;
  }

  const domainLine = Object.entries(byDomain)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${k} (${n})`)
    .join(", ");

  const relevantTitles = relevant
    .slice(0, 5)
    .map((d) => d.title)
    .join("; ");

  const recentThemes = decisions
    .slice(0, 8)
    .map((d) => d.raw_input.slice(0, 120).replace(/\s+/g, " "))
    .join(" | ");

  const summary = [
    `Total past decisions analyzed: ${decisions.length}.`,
    `Domain distribution: ${domainLine}.`,
    relevantTitles
      ? `Most relevant to current narrative: ${relevantTitles}.`
      : null,
    `Recent narrative themes: ${recentThemes.slice(0, MAX_SUMMARY_CHARS - 200)}.`,
  ]
    .filter(Boolean)
    .join("\n");

  return summary.length > MAX_SUMMARY_CHARS
    ? `${summary.slice(0, MAX_SUMMARY_CHARS)}...`
    : summary;
}
