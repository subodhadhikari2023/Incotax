import type { Page } from "@playwright/test";

import { ADMIN_TEST_PASSWORD } from "./admin-password";
import { expect, test } from "./test";

// Really saves content and changes every public page, so it runs in its own Playwright project,
// after the others (see playwright.config.ts). It starts and ends by clearing every field, which
// also keeps a retry clean.
const details = {
  phone: "+91 90000 00000",
  whatsappNumber: "+91 90000-00000",
  email: "test@example.test",
  address: "1 Test Street, Patna",
  hours: "Monday to Saturday, 10 AM to 8 PM",
};
const labels = {
  phone: "Phone",
  whatsappNumber: "WhatsApp number",
  email: "Email",
  address: "Office address",
  hours: "Hours",
};
const fields = Object.keys(labels) as (keyof typeof labels)[];

async function saveForm(page: Page, values: Partial<typeof details>) {
  await page.goto("/admin/business");
  for (const field of fields) await page.getByLabel(labels[field]).fill(values[field] ?? "");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toHaveText(/saved/i);
}

test("saved business details replace the placeholders across the public site", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(ADMIN_TEST_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await test.step("start clean: the form is blank and pages show placeholders", async () => {
    await saveForm(page, {});
    await page.goto("/admin/business");
    for (const field of fields) await expect(page.getByLabel(labels[field])).toHaveValue("");
    await page.goto("/");
    await expect(page.getByText("[Phone number]").first()).toBeVisible();
  });

  await test.step("an invalid value is refused and nothing changes", async () => {
    await page.goto("/admin/business");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "email" })).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("not-an-email");
    await expect(page.getByRole("status")).toHaveCount(0);

    await page.goto("/admin/business");
    await expect(page.getByLabel("Email")).toHaveValue("");
  });

  await test.step("saving keeps the values in the form", async () => {
    await saveForm(page, details);
    await expect(page.getByLabel("WhatsApp number")).toHaveValue("919000000000");
    await page.goto("/admin/business");
    await expect(page.getByLabel("Phone")).toHaveValue(details.phone);
    await expect(page.getByLabel("WhatsApp number")).toHaveValue("919000000000");
  });

  await test.step("the home page shows them, with no deploy", async () => {
    await page.goto("/");
    await expect(page.getByText(details.phone).first()).toBeVisible();
    await expect(page.getByText(details.email).first()).toBeVisible();
    await expect(page.getByText(details.hours).first()).toBeVisible();
    await expect(page.getByText("[Phone number]")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Chat on WhatsApp" }).first()).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/919000000000/,
    );

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(jsonLd ?? "{}")).toMatchObject({
      telephone: details.phone,
      email: details.email,
      address: details.address,
    });
  });

  await test.step("other pages show them too", async () => {
    await page.goto("/contact");
    await expect(page.getByRole("main").getByText(details.address)).toBeVisible();
    await expect(page.getByRole("main").getByText(details.hours)).toBeVisible();

    await page.goto("/services/gst-registration");
    await expect(page.getByRole("contentinfo").getByText(details.phone)).toBeVisible();
    await expect(page.getByRole("link", { name: "Chat on WhatsApp" }).first()).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/919000000000/,
    );

    await page.goto("/privacy-policy");
    await expect(page.getByRole("contentinfo").getByText(details.address)).toBeVisible();

    await page.goto("/no-such-page");
    await expect(page.getByRole("contentinfo").getByText(details.phone)).toBeVisible();
  });

  await test.step("the header button and the enquiry form use the saved number", async () => {
    await page.addInitScript(() => {
      window.open = (url) => {
        (window as unknown as { opened: unknown }).opened = String(url);
        return null;
      };
    });
    await page.goto("/contact");
    const consultation = page.getByRole("link", { name: "Free Consultation" }).first();
    await expect(consultation).toHaveAttribute("href", /^https:\/\/wa\.me\/919000000000/);

    const form = page.getByRole("form", { name: "Contact form" });
    await form.getByLabel("Full Name").fill("Test Person");
    await form.getByLabel("Mobile Number").fill("9000000000");
    await form.getByRole("button").click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { opened?: string }).opened))
      .toMatch(/^https:\/\/wa\.me\/919000000000/);
  });

  await test.step("clearing the fields brings the placeholders back", async () => {
    await saveForm(page, {});
    await page.goto("/");
    await expect(page.getByText("[Phone number]").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Chat on WhatsApp" }).first()).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/(\?|$)/,
    );
  });
});
