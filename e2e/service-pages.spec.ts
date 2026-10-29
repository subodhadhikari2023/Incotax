import { expect, test } from "@playwright/test";

import { services } from "../src/content/services";

test("every service page loads with its name as the heading", async ({ page }) => {
  for (const service of services) {
    const response = await page.goto(`/services/${service.slug}`);
    expect(response?.status(), service.slug).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(service.name);
  }
});

test("plan service: breadcrumb, starting price, plans and other services", async ({ page }) => {
  await page.goto("/services/private-limited-company-incorporation");

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  await expect(breadcrumb.getByRole("link", { name: "Services" })).toHaveAttribute(
    "href",
    "/#services",
  );

  const fee = page.getByRole("region", { name: "Fee for this service" });
  await expect(fee.getByText("₹1,499", { exact: true }).first()).toBeVisible();
  await expect(fee.getByText("Premium")).toBeVisible();

  await expect(page.getByText("Included in: Standard, Premium").first()).toBeVisible();

  const others = page.getByRole("region", { name: "Other Services" });
  await expect(others.getByRole("link", { name: /Learn more/ })).toHaveCount(3);
});

test("quote service shows no price", async ({ page }) => {
  await page.goto("/services/iso-certification");
  const fee = page.getByRole("region", { name: "Fee for this service" });

  await expect(fee.getByRole("link", { name: "Get a quote on WhatsApp" })).toBeVisible();
  await expect(fee.getByText(/₹/)).toHaveCount(0);
});

test("Services is active in the header on a service page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Main nav is desktop only");
  await page.goto("/services/gst-registration");

  await expect(page.getByRole("button", { name: "Services" })).toHaveAttribute(
    "data-active",
    "true",
  );
});

test("unknown service returns 404", async ({ page }) => {
  const response = await page.goto("/services/not-a-service");
  expect(response?.status()).toBe(404);
});

test("service page has no horizontal scroll", async ({ page }) => {
  await page.goto("/services/private-limited-company-incorporation");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBe(0);
});
