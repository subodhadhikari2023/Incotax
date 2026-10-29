import { expect, test } from "@playwright/test";

test("pop-up opens on the home page, closes, and stays closed after reload", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Your Requirement. Our Expertise." });

  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel(/Full Name/)).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(dialog).toBeHidden();
});

test("pop-up does not open on other pages", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
