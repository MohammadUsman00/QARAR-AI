import { expect, test } from "@playwright/test";

test.describe("landing smoke", () => {
  test("renders hero and pricing CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("The world finally has a tool")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Begin Your First Autopsy" }).first(),
    ).toBeVisible();
    await expect(page.getByText("Pricing")).toBeVisible();
  });
});
