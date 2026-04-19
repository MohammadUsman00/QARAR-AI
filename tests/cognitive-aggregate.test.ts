import {
  buildDomainScores,
  buildMonthlyQualityTrend,
} from "@/lib/cognitive-aggregate";

describe("cognitive aggregate", () => {
  test("buildDomainScores averages ratings per domain", () => {
    const scores = buildDomainScores([
      {
        domain: "career",
        outcome_rating: 8,
        created_at: "2026-01-15T10:00:00.000Z",
      },
      {
        domain: "career",
        outcome_rating: 6,
        created_at: "2026-02-15T10:00:00.000Z",
      },
    ]);
    expect(scores.career).toBe(7);
  });

  test("buildMonthlyQualityTrend returns 12 months", () => {
    const trend = buildMonthlyQualityTrend([
      {
        domain: "other",
        outcome_rating: 5,
        created_at: "2026-04-10T10:00:00.000Z",
      },
    ]);
    expect(trend.length).toBe(12);
    expect(trend.every((t) => typeof t.score === "number")).toBe(true);
  });
});
