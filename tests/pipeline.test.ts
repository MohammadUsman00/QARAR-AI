import { normalizeBiasName } from "@/lib/pipeline/bias-taxonomy";
import { rankByTextSimilarity, textSimilarityScore } from "@/lib/pipeline/text-similarity";
import { buildDecisionSummary } from "@/lib/pipeline/summary";
import {
  enrichTriggerMap,
  computeTopBiases,
  computeProfileConfidence,
} from "@/lib/pipeline/profile-enrichment";
import { scoreAutopsyRubric } from "@/lib/eval/rubric";
import { goldenCases } from "@/lib/eval/golden-cases";
import type { AutopsyResult } from "@/lib/gemini";

function mockAutopsy(overrides: Partial<AutopsyResult> = {}): AutopsyResult {
  return {
    root_cause: "Urgency and social pressure drove a rushed choice without evidence.",
    cognitive_biases: [
      {
        name: "Urgency bias",
        description: "Speed outweighed verification.",
        severity: "high",
      },
    ],
    emotional_triggers: [{ trigger: "Pressure", pattern: "Reactive decision" }],
    nervous_system_state: "Elevated arousal.",
    life_patterns: [
      {
        pattern: "Acting fast under pressure",
        how_it_manifested_here: "Accepted offer same day.",
      },
    ],
    wait_72hr_probability: 0.75,
    alternate_outcome_probability: 0.6,
    estimated_cost_context: "Career mismatch cost.",
    immediate_actions: [
      {
        action: "Use a 72-hour waiting rule before accepting offers.",
        why: "Reduces urgency-driven errors.",
      },
    ],
    pattern_break_strategy: "Pause and verify evidence before committing.",
    full_report_markdown:
      "## Autopsy\nIdentified urgency, FOMO, present bias, optimism bias, emotional arousal, and social proof pressure. Wait 72 hours before major career, health, and relationship moves. Use a decision rule and checklist before acting. Review evidence quality separately from emotional triggers. Relationship loyalty vs financial risk boundary. No clinical diagnosis.",
    ...overrides,
  };
}

describe("pipeline modules", () => {
  test("normalizes bias names to canonical labels", () => {
    expect(normalizeBiasName("sunk cost fallacy")).toBe("Sunk cost fallacy");
    expect(normalizeBiasName("FOMO")).toBe("FOMO / scarcity bias");
  });

  test("ranks decisions by text similarity", () => {
    const query = "I quit my job impulsively after one bad meeting";
    const items = [
      { raw_input: "I resigned the same evening after a tense manager call" },
      { raw_input: "I bought crypto on a whim during hype" },
    ];
    const ranked = rankByTextSimilarity(query, items, 2);
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
    expect(textSimilarityScore(query, items[0].raw_input)).toBeGreaterThanOrEqual(
      textSimilarityScore(query, items[1].raw_input),
    );
  });

  test("builds rolling history summary", () => {
    const summary = buildDecisionSummary(
      [
        {
          title: "Job quit",
          raw_input: "Quit after bad meeting",
          domain: "career",
        },
        {
          title: "Course buy",
          raw_input: "Bought course on timer",
          domain: "financial",
        },
      ],
      [{ title: "Job quit", raw_input: "Quit after bad meeting", domain: "career" }],
    );
    expect(summary).toContain("Total past decisions");
    expect(summary).toContain("career");
  });

  test("enriches trigger map from autopsies", () => {
    const map = enrichTriggerMap([
      {
        cognitive_biases: null,
        emotional_triggers: [
          { trigger: "Pressure", pattern: "Rush" },
          { trigger: "Pressure", pattern: "Rush" },
        ],
      },
    ]);
    expect(map[0].trigger).toBe("Pressure");
    expect(map[0].count).toBe(2);
  });

  test("computes profile confidence with feedback boost", () => {
    const low = computeProfileConfidence(2, null, 1);
    const high = computeProfileConfidence(10, 0.8, 4);
    expect(high).toBeGreaterThan(low);
  });

  test("computes top biases with normalization", () => {
    const top = computeTopBiases(
      [
        {
          cognitive_biases: [{ name: "fomo" }, { name: "FOMO" }],
          emotional_triggers: null,
        },
      ],
      1,
    );
    expect(top[0].bias).toBe("FOMO / scarcity bias");
    expect(top[0].frequency).toBe(2);
  });
});

describe("rubric evaluation", () => {
  test("scores golden case rubrics on mock autopsy", () => {
    const autopsy = mockAutopsy();
    for (const item of goldenCases) {
      const report = scoreAutopsyRubric(autopsy, item.expectedRubric);
      expect(report.passed).toBe(true);
    }
  });

  test("golden cases cover five domains", () => {
    expect(goldenCases.length).toBeGreaterThanOrEqual(5);
    const domains = new Set(goldenCases.map((c) => c.domain));
    expect(domains.size).toBeGreaterThanOrEqual(4);
  });
});
