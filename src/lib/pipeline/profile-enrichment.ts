import { normalizeBiasName } from "@/lib/pipeline/bias-taxonomy";
import type { AutopsyRow, DecisionForAggregate } from "@/lib/pipeline/types";

export type TriggerMapEntry = {
  trigger: string;
  pattern: string;
  count: number;
};

export type EnrichedProfileFields = {
  top_biases: { bias: string; frequency: number; percentage: number }[];
  trigger_map: TriggerMapEntry[];
  high_risk_states: { state: string; count: number }[];
  worst_decision_times: { hour_bucket: string; count: number }[];
  profile_confidence: number;
};

export function enrichTriggerMap(
  autopsies: AutopsyRow[],
): TriggerMapEntry[] {
  const counts = new Map<string, TriggerMapEntry>();

  for (const row of autopsies) {
    const triggers = row.emotional_triggers;
    if (!Array.isArray(triggers)) continue;

    for (const t of triggers) {
      const trigger = t.trigger?.trim();
      const pattern = t.pattern?.trim() ?? "";
      if (!trigger) continue;

      const key = `${trigger}::${pattern}`;
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { trigger, pattern, count: 1 });
      }
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

export function enrichHighRiskStates(
  decisions: DecisionForAggregate[],
): { state: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const d of decisions) {
    const state = d.emotional_state_before?.trim();
    if (!state) continue;
    const rating = d.outcome_rating;
    if (rating != null && rating <= 4) {
      counts.set(state, (counts.get(state) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function enrichWorstDecisionTimes(
  decisions: DecisionForAggregate[],
): { hour_bucket: string; count: number }[] {
  const buckets = new Map<string, number>();

  for (const d of decisions) {
    if (d.outcome_rating == null || d.outcome_rating > 4) continue;
    const hour = new Date(d.created_at).getHours();
    const bucket =
      hour < 6
        ? "late night (0-5)"
        : hour < 12
          ? "morning (6-11)"
          : hour < 18
            ? "afternoon (12-17)"
            : "evening (18-23)";
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .map(([hour_bucket, count]) => ({ hour_bucket, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}

export function computeTopBiases(
  autopsies: AutopsyRow[],
  totalDecisions: number,
): { bias: string; frequency: number; percentage: number }[] {
  const biasCounts: Record<string, number> = {};

  for (const row of autopsies) {
    const biases = row.cognitive_biases;
    if (!Array.isArray(biases)) continue;
    for (const b of biases) {
      if (!b?.name) continue;
      const canonical = normalizeBiasName(b.name);
      biasCounts[canonical] = (biasCounts[canonical] ?? 0) + 1;
    }
  }

  return Object.entries(biasCounts)
    .map(([bias, frequency]) => ({
      bias,
      frequency,
      percentage: Math.min(
        100,
        Math.round((frequency / Math.max(totalDecisions, 1)) * 100),
      ),
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8);
}

export function computeProfileConfidence(
  totalDecisions: number,
  feedbackHelpfulRate: number | null,
  domainCoverage: number,
): number {
  const base = Math.min(0.95, 0.2 + totalDecisions * 0.04);
  const feedbackBoost =
    feedbackHelpfulRate != null ? (feedbackHelpfulRate - 0.5) * 0.1 : 0;
  const domainBoost = Math.min(0.1, domainCoverage * 0.02);
  return Math.round(Math.min(0.98, Math.max(0.15, base + feedbackBoost + domainBoost)) * 100) / 100;
}

export function buildEnrichedProfile(
  autopsies: AutopsyRow[],
  decisions: DecisionForAggregate[],
  totalDecisions: number,
  feedbackHelpfulRate: number | null,
): EnrichedProfileFields {
  const domainsWithData = new Set(
    decisions.filter((d) => d.outcome_rating != null).map((d) => d.domain ?? "other"),
  );

  return {
    top_biases: computeTopBiases(autopsies, totalDecisions),
    trigger_map: enrichTriggerMap(autopsies),
    high_risk_states: enrichHighRiskStates(decisions),
    worst_decision_times: enrichWorstDecisionTimes(decisions),
    profile_confidence: computeProfileConfidence(
      totalDecisions,
      feedbackHelpfulRate,
      domainsWithData.size,
    ),
  };
}
