import { expect, test } from "@playwright/test";

test("home page loads with the firm's name as the title", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("IncoTax Legal Services");
});
