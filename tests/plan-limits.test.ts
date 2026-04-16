import { getPlanLimits } from "@/lib/plan-limits";

describe("plan limits", () => {
  test("free has a hard autopsy cap", () => {
    const free = getPlanLimits("free");
    expect(free.autopsies_lifetime).toBe(3);
    expect(free.patterns_access).toBe(false);
  });

  test("pro unlocks patterns and pdf", () => {
    const pro = getPlanLimits("pro");
    expect(pro.patterns_access).toBe(true);
    expect(pro.pdf_export).toBe(true);
  });

  test("unknown plans safely fall back to free", () => {
    const fallback = getPlanLimits("unknown-plan");
    expect(fallback.autopsies_lifetime).toBe(3);
  });
});
