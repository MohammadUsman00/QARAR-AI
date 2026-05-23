import { decisionDomainSchema } from "@/lib/api-validation";
import { goldenCases } from "@/lib/eval/golden-cases";
import { scoreAutopsyRubric } from "@/lib/eval/rubric";
import type { AutopsyResult } from "@/lib/gemini";

describe("autopsy golden evaluation cases", () => {
  test("cover representative domains and quality rubrics", () => {
    expect(goldenCases.length).toBeGreaterThanOrEqual(5);

    for (const item of goldenCases) {
      expect(decisionDomainSchema.parse(item.domain)).toBe(item.domain);
      expect(item.narrative.length).toBeGreaterThan(40);
      expect(item.expectedRubric.length).toBeGreaterThanOrEqual(3);
    }
  });

  test("rubric schema accepts all golden rubric keys", () => {
    const placeholder: AutopsyResult = {
      root_cause: "Urgency and pressure led to a rushed decision without verifying evidence.",
      cognitive_biases: [
        {
          name: "Urgency bias",
          description: "Acted too fast.",
          severity: "medium",
        },
      ],
      emotional_triggers: [{ trigger: "Pressure", pattern: "Rush" }],
      nervous_system_state: "Elevated.",
      life_patterns: [
        { pattern: "Fast action", how_it_manifested_here: "Same-day choice." },
      ],
      wait_72hr_probability: 0.7,
      alternate_outcome_probability: 0.5,
      estimated_cost_context: "Moderate opportunity cost.",
      immediate_actions: [
        {
          action: "Wait 72 hours before major decisions.",
          why: "Reduces reactive errors.",
        },
      ],
      pattern_break_strategy: "Use a cooling-off rule.",
      full_report_markdown:
        "Forensic analysis: urgency, FOMO, emotional arousal. Wait before responding. No clinical diagnosis. Evidence quality matters.",
    };

    for (const item of goldenCases) {
      const report = scoreAutopsyRubric(placeholder, item.expectedRubric);
      expect(report.scores.every((s) => s.criterion.length > 0)).toBe(true);
    }
  });
});
