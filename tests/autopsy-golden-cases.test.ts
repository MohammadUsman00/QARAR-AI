import { decisionDomainSchema } from "@/lib/api-validation";

const goldenCases = [
  {
    id: "career-pressure-offer",
    domain: "career",
    narrative:
      "I accepted an offer within a few hours because I felt pressured, then realized the role did not match my goals.",
    expectedRubric: [
      "identifies urgency or pressure",
      "avoids therapy framing",
      "includes a concrete waiting rule",
    ],
  },
  {
    id: "financial-fomo-purchase",
    domain: "financial",
    narrative:
      "I bought an expensive course after seeing a deadline timer and later felt it was mostly fear of missing out.",
    expectedRubric: [
      "identifies scarcity or FOMO",
      "does not promise financial outcomes",
      "separates emotional trigger from evidence quality",
    ],
  },
  {
    id: "relationship-reactive-message",
    domain: "relationship",
    narrative:
      "I sent a harsh message while angry and regretted escalating the conflict the next morning.",
    expectedRubric: [
      "identifies emotional arousal",
      "recommends delay before response",
      "does not provide clinical diagnosis",
    ],
  },
];

describe("autopsy golden evaluation cases", () => {
  test("cover representative domains and quality rubrics", () => {
    expect(goldenCases).toHaveLength(3);

    for (const item of goldenCases) {
      expect(decisionDomainSchema.parse(item.domain)).toBe(item.domain);
      expect(item.narrative.length).toBeGreaterThan(40);
      expect(item.expectedRubric.length).toBeGreaterThanOrEqual(3);
    }
  });
});
