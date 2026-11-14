import { expect, test } from "./test";

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

  const plans = page.getByRole("region", { name: "Choose your plan" });
  await expect(plans.getByText("Most Popular")).toBeVisible();
  await expect(page.getByText(/^Included in:/)).toHaveCount(0);

  const others = page.getByRole("region", { name: "Other Services" });
  await expect(others.getByRole("link", { name: /Learn more/ })).toHaveCount(3);
});

test("plan cards: all three side by side from tablet up, tabs on phones", async ({
  page,
}, testInfo) => {
  await page.goto("/services/private-limited-company-incorporation");
  const plans = page.getByRole("region", { name: "Choose your plan" });
  const card = (name: string) => plans.getByRole("tabpanel", { name, includeHidden: true });

  if (testInfo.project.name !== "phone") {
    await expect(plans.getByRole("tablist")).toBeHidden();
    for (const name of ["Basic", "Standard", "Premium"]) await expect(card(name)).toBeVisible();
    return;
  }

  await expect(plans.getByRole("tab", { name: "Standard" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(card("Standard")).toBeVisible();
  await expect(card("Basic")).toBeHidden();

  await plans.getByRole("tab", { name: "Premium" }).click();
  await expect(card("Premium")).toBeVisible();
  await expect(card("Standard")).toBeHidden();
  await expect(card("Premium").getByText("₹7,499")).toBeVisible();

  await card("Premium")
    .getByRole("button", { name: /^Show all \d+ items$/ })
    .click();
  await expect(card("Premium").getByRole("button", { name: "Show fewer" })).toBeVisible();
  await expect(card("Premium").getByRole("link", { name: /Get Started/ })).toHaveAttribute(
    "href",
    /Premium%20plan/,
  );
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
