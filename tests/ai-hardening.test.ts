import { autopsyAnalyzeRequestSchema } from "@/lib/api-validation";
import { assertSafeAutopsyOutput } from "@/lib/llm-safety";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AutopsyResult } from "@/lib/gemini";

function baseAutopsy(overrides: Partial<AutopsyResult> = {}): AutopsyResult {
  return {
    root_cause: "The decision was driven by urgency and incomplete evidence.",
    cognitive_biases: [
      {
        name: "Urgency bias",
        description: "Speed mattered more than verification.",
        severity: "medium",
      },
    ],
    emotional_triggers: [{ trigger: "Pressure", pattern: "Reactive action" }],
    nervous_system_state: "Elevated arousal with narrowed attention.",
    life_patterns: [
      {
        pattern: "Moving quickly under social pressure",
        how_it_manifested_here: "The user acted before checking alternatives.",
      },
    ],
    wait_72hr_probability: 0.7,
    alternate_outcome_probability: 0.6,
    estimated_cost_context: "No clear financial estimate.",
    immediate_actions: [
      {
        action: "Write down the decision rule before acting next time.",
        why: "This slows reactive choices.",
      },
    ],
    pattern_break_strategy: "Create a waiting rule for high-pressure choices.",
    full_report_markdown: "## Decision Autopsy\nA concise decision analysis.",
    ...overrides,
  };
}

describe("AI hardening utilities", () => {
  test("validates and normalizes autopsy requests", () => {
    const parsed = autopsyAnalyzeRequestSchema.parse({
      raw_input: "I accepted a job offer too quickly and regretted the mismatch.",
      domain: "career",
      emotional_state: "Anxious",
      outcome_rating: "4",
      decision_date: "2026-04-26",
    });

    expect(parsed.domain).toBe("career");
    expect(parsed.outcome_rating).toBe(4);
  });

  test("rejects invalid autopsy request domains", () => {
    expect(() =>
      autopsyAnalyzeRequestSchema.parse({
        raw_input: "I accepted a job offer too quickly and regretted the mismatch.",
        domain: "unknown",
      }),
    ).toThrow();
  });

  test("blocks high-risk generated advice", () => {
    expect(() =>
      assertSafeAutopsyOutput(
        baseAutopsy({
          immediate_actions: [
            {
              action: "Stop taking medication before making this decision.",
              why: "Unsafe model output example.",
            },
          ],
        }),
      ),
    ).toThrow("Unsafe advice pattern");
  });

  test("enforces fixed-window rate limits", () => {
    const key = `test:${Date.now()}:${Math.random()}`;

    expect(
      checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed,
    ).toBe(true);
    expect(
      checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed,
    ).toBe(true);
    expect(
      checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed,
    ).toBe(false);
  });
});
