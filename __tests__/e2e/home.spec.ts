import { test, expect } from "@playwright/test";

test("must load the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Selecione um prompt" })).toBeVisible();
});
