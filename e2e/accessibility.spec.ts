import AxeBuilder from "@axe-core/playwright";
import { expect as baseExpect, test as baseTest } from "@playwright/test";

import { routes } from "./routes";
import { expect, test } from "./test";

// axe-core checks each page against WCAG 2.1 A/AA at every project width (1440 / 768 / 390).
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

for (const route of routes) {
  test(`no accessibility violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(violations).toEqual([]);
  });
}

baseTest("no accessibility violations in the open pop-up form", async ({ page }) => {
  await page.goto("/");
  await baseExpect(page.getByRole("dialog")).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
  baseExpect(violations).toEqual([]);
});

test("no accessibility violations in the open mobile menu", async ({ page }, info) => {
  test.skip(info.project.name === "desktop", "The menu button only shows below 1024px.");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
  expect(violations).toEqual([]);
});
