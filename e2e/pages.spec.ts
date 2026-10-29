import { legalLinks } from "../src/content/site";

import { expect, test } from "./test";

test("Why IncoTax: two founders, stats and courts/areas", async ({ page }) => {
  const response = await page.goto("/why-incotax");
  expect(response?.status()).toBe(200);

  const team = page.getByRole("region", { name: "Our Team" });
  await expect(team.getByRole("article")).toHaveCount(2);
  await expect(team.getByRole("heading", { name: "Zeeshan Khan" })).toBeVisible();
  await expect(team.getByRole("heading", { name: "Palak Khemka" })).toBeVisible();
  await expect(page.getByText("High Court of Patna")).toBeVisible();
  await expect(page.getByRole("region", { name: "Our numbers" }).getByRole("listitem")).toHaveCount(
    4,
  );
});

test("Contact Us: form, WhatsApp card and contact details", async ({ page }) => {
  const response = await page.goto("/contact");
  expect(response?.status()).toBe(200);

  const form = page.getByRole("form", { name: "Contact form" });
  await expect(form.getByLabel(/Full Name/)).toBeVisible();
  await expect(form.getByLabel("Message")).toBeVisible();
  await expect(page.getByRole("link", { name: "Chat on WhatsApp" }).first()).toBeVisible();
  await expect(page.getByText("[Office address]").first()).toBeVisible();
});

test("Contact form shows errors when submitted empty", async ({ page }) => {
  await page.goto("/contact");
  const form = page.getByRole("form", { name: "Contact form" });

  await form.getByRole("button").click();
  await expect(form.getByText("Please enter your full name.")).toBeVisible();
});

test("all five legal pages use the legal template", async ({ page }) => {
  for (const link of legalLinks) {
    const response = await page.goto(link.href);
    expect(response?.status(), link.href).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(link.label);
    await expect(page.getByText(/Last updated:/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Contact us", exact: true }),
      "Questions box links to Contact",
    ).toHaveAttribute("href", "/contact");
  }
});

test("legal 'On this page' links jump to the sections", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "phone", "Checked once on wider screens");
  await page.goto("/privacy-policy");
  const toc = page.getByRole("navigation", { name: "On this page" });

  await expect(toc.getByRole("link")).toHaveCount(5);
  await toc.getByRole("link").nth(2).click();
  await expect(page).toHaveURL(/#section-3$/);
});

test("unknown pages show the 404 page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  await expect(page.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
});

test("new pages have no horizontal scroll", async ({ page }) => {
  for (const path of ["/why-incotax", "/contact", "/terms-and-conditions"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBe(0);
  }
});
