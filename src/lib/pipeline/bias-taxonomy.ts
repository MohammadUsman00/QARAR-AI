/** Canonical bias labels for aggregation and alerts. */
export const CANONICAL_BIASES: Record<string, string> = {
  "sunk cost": "Sunk cost fallacy",
  "sunk cost fallacy": "Sunk cost fallacy",
  "loss aversion": "Loss aversion",
  "confirmation bias": "Confirmation bias",
  "anchoring": "Anchoring bias",
  "anchoring bias": "Anchoring bias",
  "availability heuristic": "Availability heuristic",
  "availability": "Availability heuristic",
  "urgency": "Urgency bias",
  "urgency bias": "Urgency bias",
  "fomo": "FOMO / scarcity bias",
  "scarcity": "FOMO / scarcity bias",
  "scarcity bias": "FOMO / scarcity bias",
  "optimism bias": "Optimism bias",
  "overconfidence": "Overconfidence bias",
  "overconfidence bias": "Overconfidence bias",
  "status quo": "Status quo bias",
  "status quo bias": "Status quo bias",
  "recency": "Recency bias",
  "recency bias": "Recency bias",
  "hindsight": "Hindsight bias",
  "hindsight bias": "Hindsight bias",
  "fundamental attribution": "Fundamental attribution error",
  "social proof": "Social proof bias",
  "authority bias": "Authority bias",
  "affect heuristic": "Affect heuristic",
  "emotional reasoning": "Emotional reasoning",
  "planning fallacy": "Planning fallacy",
  "negativity bias": "Negativity bias",
  "reactance": "Reactance",
  "bandwagon": "Bandwagon effect",
};

export function normalizeBiasName(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (CANONICAL_BIASES[key]) return CANONICAL_BIASES[key];

  for (const [pattern, canonical] of Object.entries(CANONICAL_BIASES)) {
    if (key.includes(pattern) || pattern.includes(key)) {
      return canonical;
    }
  }

  return raw.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function normalizeBiasesInResult<T extends { name: string }>(
  biases: T[],
): T[] {
  return biases.map((b) => ({
    ...b,
    name: normalizeBiasName(b.name),
  }));
}
