import { expect, test } from "@playwright/test";

// Which header parts each design width shows (CLAUDE.md §4.5).
const expected = {
  desktop: { nav: true, menuButton: false, consultation: true },
  tablet: { nav: false, menuButton: true, consultation: true },
  phone: { nav: false, menuButton: true, consultation: false },
} as const;

test("header shows the right parts at this width", async ({ page }, testInfo) => {
  const want = expected[testInfo.project.name as keyof typeof expected];
  await page.goto("/");
  const header = page.getByRole("banner");

  await expect(header.getByRole("navigation", { name: "Main" })).toBeVisible({
    visible: want.nav,
  });
  await expect(header.getByRole("button", { name: "Open menu" })).toBeVisible({
    visible: want.menuButton,
  });
  await expect(header.getByRole("link", { name: "Free Consultation" })).toBeVisible({
    visible: want.consultation,
  });
});

test("brand name in the header stays on one line", async ({ page }) => {
  await page.goto("/");
  const brand = page.getByRole("banner").getByText("IncoTax Legal Services");
  const { height, lineHeight } = await brand.evaluate((el) => ({
    height: el.getBoundingClientRect().height,
    lineHeight: parseFloat(getComputedStyle(el).lineHeight),
  }));

  expect(height).toBeLessThan(lineHeight * 1.5);
});

test("top bar and footer are on the page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("[Phone number]").first()).toBeVisible();
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("navigation", { name: "Legal" })).toBeVisible();
  await expect(footer.getByText(/All rights reserved\./)).toBeVisible();
});

test("no horizontal scroll at this width", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBe(0);
});

test("menu button opens the mobile menu", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop", "No menu button on desktop");
  await page.goto("/");

  await page.getByRole("button", { name: "Open menu" }).click();
  const mobileNav = page.getByRole("navigation", { name: "Mobile" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Why IncoTax" })).toBeVisible();
});
