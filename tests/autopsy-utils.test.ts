import { parseRoughInr, titleFromInput } from "@/lib/autopsy";

describe("autopsy utilities", () => {
  test("parses rupee formatted values", () => {
    expect(parseRoughInr("Estimated impact: ₹4,20,000 since 2021")).toBe(420000);
  });

  test("parses lakh values", () => {
    expect(parseRoughInr("Around 3.5 lakh total opportunity cost")).toBe(350000);
  });

  test("returns null when no value exists", () => {
    expect(parseRoughInr("No financial signal available")).toBeNull();
  });

  test("creates stable autopsy title", () => {
    expect(titleFromInput("I quit quickly\nthen regretted it")).toBe("I quit quickly...");
  });
});
