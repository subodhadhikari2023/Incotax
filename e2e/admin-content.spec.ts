import type { Page } from "@playwright/test";

import { ADMIN_TEST_PASSWORD } from "./admin-password";
import { expect, test } from "./test";

// Really saves content and changes every public page, so it runs in its own Playwright project,
// after the others (see playwright.config.ts). Each test starts by clearing what it edits, which
// also keeps a retry clean. Every save rewrites the whole store, so these tests can't run in parallel.
test.describe.configure({ mode: "serial" });

async function logIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(ADMIN_TEST_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

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

  await logIn(page);

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

// Empties a list in the home form by removing its first row until none are left.
async function clearList(page: Page, row: string) {
  const first = page.getByRole("button", { name: `Remove ${row} 1`, exact: true });
  while (await first.count()) await first.click();
}

async function addRow(page: Page, row: string, labels: Record<string, string>) {
  await page.getByRole("button", { name: `Add ${row}`, exact: true }).click();
  for (const [label, value] of Object.entries(labels)) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
}

async function saveHome(page: Page) {
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toHaveText(/saved/i);
}

test("saved home page content shows on the public site, and empty lists hide sections", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await logIn(page);
  await page
    .getByRole("navigation", { name: "Admin sections" })
    .getByRole("link", { name: "Home page" })
    .click();
  await expect(page).toHaveURL(/\/admin\/home$/);

  await test.step("save text and lists", async () => {
    await page.getByLabel("Label above the headline", { exact: true }).fill("Trusted advisers");
    await page.getByLabel("Headline", { exact: true }).fill("Build Your Business Right");
    await page.getByLabel("Gold words in the headline", { exact: true }).fill("Business Right");
    await page.getByLabel("Supporting text", { exact: true }).fill("Support text for the hero");
    await page.getByLabel("Services intro", { exact: true }).fill("Services line");
    await page.getByLabel("How it works heading", { exact: true }).fill("How we work");
    await page.getByLabel("How it works intro", { exact: true }).fill("Process line");
    await page.getByLabel("Fees intro", { exact: true }).fill("Clear fees");
    await page.getByLabel("Featured plan tag", { exact: true }).fill("Most chosen");
    await page.getByLabel("Reviews intro", { exact: true }).fill("Reviews line");

    for (const row of ["stat", "client", "step", "fee highlight", "review"]) {
      await clearList(page, row);
    }
    await addRow(page, "stat", { "Stat 1 value": "5+", "Stat 1 label": "Years" });
    await addRow(page, "stat", { "Stat 2 value": "90", "Stat 2 label": "Cases" });
    await addRow(page, "client", { "Client 1 name": "Acme Traders" });
    await addRow(page, "client", { "Client 2 name": "Beta Stores" });
    await addRow(page, "step", { "Step 1 title": "Message us", "Step 1 text": "On WhatsApp" });
    await addRow(page, "fee highlight", { "Fee highlight 1": "Name approval" });
    await addRow(page, "review", {
      "Review 1 text": "Very helpful team",
      "Review 1 name": "A. Client",
      "Review 1 city or service": "Patna",
    });
    await saveHome(page);
  });

  await test.step("the form keeps what was saved", async () => {
    await page.goto("/admin/home");
    await expect(page.getByLabel("Headline", { exact: true })).toHaveValue(
      "Build Your Business Right",
    );
    await expect(page.getByLabel("Client 2 name", { exact: true })).toHaveValue("Beta Stores");
  });

  await test.step("the home page shows it, with no deploy", async () => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Build Your Business Right");
    const hero = page.getByRole("region", { name: "Introduction" });
    await expect(hero.locator("h1 em")).toHaveText("Business Right");
    await expect(hero.getByText("Trusted advisers")).toBeVisible();
    await expect(hero.getByText("Support text for the hero")).toBeVisible();
    await expect(hero.getByRole("listitem")).toHaveCount(2);

    const clients = page.getByRole("region", { name: "Clients We Have Worked With" });
    await expect(clients.getByRole("listitem")).toHaveCount(2);
    await expect(clients.getByText("Acme Traders")).toBeVisible();

    await expect(page.locator("#services").getByText("Services line")).toBeVisible();

    const how = page.getByRole("region", { name: "How it works" });
    await expect(how.getByRole("heading", { name: "How we work" })).toBeVisible();
    await expect(how.getByRole("listitem")).toHaveCount(1);

    const fees = page.getByRole("region", { name: "Fees" });
    await expect(fees.getByText("Clear fees")).toBeVisible();
    await expect(fees.getByText("Most chosen")).toBeVisible();
    await expect(fees.getByText("Name approval")).toHaveCount(3);
    await expect(fees.getByText("₹3,499")).toBeVisible();

    const reviews = page.getByRole("region", { name: "What Clients Say" });
    await expect(reviews.getByRole("article")).toHaveCount(1);
    await expect(reviews.getByText("Very helpful team")).toBeVisible();
  });

  await test.step("Why IncoTax shows the same stats", async () => {
    await page.goto("/why-incotax");
    const numbers = page.getByRole("region", { name: "Our numbers" });
    await expect(numbers.getByRole("listitem")).toHaveCount(2);
    await expect(numbers.getByText("Cases")).toBeVisible();
  });

  await test.step("invalid content is refused and nothing changes", async () => {
    await page.goto("/admin/home");
    await page.getByLabel("Gold words in the headline", { exact: true }).fill("Not there");
    await page.getByLabel("Review 1 name", { exact: true }).fill("");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "headline" })).toBeVisible();
    await expect(page.getByLabel("Review 1 name", { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.getByRole("status")).toHaveCount(0);

    await page.goto("/");
    await expect(page.locator("h1 em")).toHaveText("Business Right");
  });

  await test.step("empty lists hide their sections; the rest of the page stays", async () => {
    await page.goto("/admin/home");
    for (const row of ["stat", "client", "step", "fee highlight", "review"]) {
      await clearList(page, row);
    }
    await saveHome(page);

    await page.goto("/");
    await expect(page.getByRole("region", { name: "Introduction" }).getByRole("list")).toHaveCount(
      0,
    );
    const headings = await page.locator("main h2").allTextContents();
    expect(headings).toEqual(expect.arrayContaining(["Our Services", "Fees"]));
    expect(headings).not.toContain("Clients We Have Worked With");
    expect(headings).not.toContain("What Clients Say");
    await expect(page.getByRole("region", { name: "How it works" })).toHaveCount(0);
    await expect(page.getByText("[Client 1 logo / name]")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Fees" }).getByRole("article")).toHaveCount(3);

    await page.goto("/why-incotax");
    await expect(page.getByRole("region", { name: "Our numbers" })).toHaveCount(0);
  });

  await test.step("clearing a text field brings its placeholder back", async () => {
    await page.goto("/admin/home");
    await page.getByLabel("Label above the headline", { exact: true }).fill("");
    await saveHome(page);

    await page.goto("/");
    await expect(page.getByText("[Short label above the headline]")).toBeVisible();
  });
});

// Fills in labelled fields on an editor page and saves.
async function saveFields(page: Page, path: string, fields: Record<string, string>) {
  await page.goto(path);
  for (const [label, value] of Object.entries(fields)) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  await saveHome(page);
}

test("the remaining editors change the public pages they belong to", async ({ page }) => {
  test.setTimeout(120_000);

  await logIn(page);

  await test.step("site-wide text reaches the WhatsApp band, buttons, forms and pop-up", async () => {
    await saveFields(page, "/admin/site", {
      "Default WhatsApp message": "Hello IncoTax team",
      "WhatsApp band heading": "Talk to us today",
      "WhatsApp band line": "Tap the button below",
      "Intro above what a service covers": "Everything included",
      "Intro above other services": "You may also need",
      "Form submit button": "Send enquiry",
      "Note under the contact form": "We reply within a day",
    });

    await page.goto("/contact");
    await expect(page.getByRole("button", { name: "Send enquiry" })).toBeVisible();
    await expect(page.getByText("We reply within a day")).toBeVisible();

    await page.goto("/why-incotax");
    await expect(page.getByRole("heading", { name: "Talk to us today" })).toBeVisible();
    const href = await page
      .getByRole("link", { name: "Chat on WhatsApp" })
      .first()
      .getAttribute("href");
    expect(decodeURIComponent(href ?? "")).toContain("Hello IncoTax team");
    const consultation = await page
      .getByRole("link", { name: "Free Consultation" })
      .first()
      .getAttribute("href");
    expect(decodeURIComponent(consultation ?? "")).toContain("Hello IncoTax team");
  });

  await test.step("Why IncoTax", async () => {
    await page.goto("/admin/why-incotax");
    await page.getByLabel("Page headline", { exact: true }).fill("Why people choose us");
    await page.getByLabel("Zeeshan Khan bio", { exact: true }).fill("An updated biography");
    await addRow(page, "about paragraph", { "About paragraph 1": "We started in Patna." });
    await clearList(page, "court");
    await addRow(page, "court", { "Court 1": "Supreme Court of India" });
    await saveHome(page);

    await page.goto("/why-incotax");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Why people choose us");
    await expect(page.getByText("An updated biography")).toBeVisible();
    await expect(page.getByText("We started in Patna.")).toBeVisible();
    await expect(page.getByText("Supreme Court of India")).toBeVisible();
    await expect(page.getByText("High Court of Patna")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Zeeshan Khan" })).toBeVisible();
  });

  await test.step("Contact page", async () => {
    await saveFields(page, "/admin/contact", {
      "Page headline": "Reach the practice",
      "Form heading": "Write to the team",
    });

    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reach the practice");
    await expect(page.getByRole("heading", { name: "Write to the team" })).toBeVisible();
  });

  await test.step("one service, without changing the others", async () => {
    await saveFields(page, "/admin/services/gst-registration", {
      "Short description": "Register for GST without the paperwork",
      "Overview paragraph two": "We handle the filing for you",
      "Card description": "GST registration, done for you",
      "WhatsApp message": "Hello, I need GST registration",
    });

    await page.goto("/admin/services");
    const card = (name: string) =>
      page.getByRole("main").locator("ul > li").filter({ hasText: name });
    await expect(card("GST Registration")).toContainText("Edited");
    await expect(card("ISO")).toContainText("Not edited yet");

    await page.goto("/services/gst-registration");
    await expect(page.getByText("Register for GST without the paperwork")).toBeVisible();
    await expect(page.getByText("We handle the filing for you")).toBeVisible();
    await expect(page.getByText("Everything included")).toBeVisible();
    await expect(page.getByText("You may also need")).toBeVisible();
    const href = await page
      .getByRole("link", { name: "Chat on WhatsApp" })
      .first()
      .getAttribute("href");
    expect(decodeURIComponent(href ?? "")).toContain("Hello, I need GST registration");

    await page.goto("/");
    await expect(page.getByText("GST registration, done for you")).toBeVisible();

    await page.goto("/services/llp-registration");
    await expect(page.getByText("Register for GST without the paperwork")).toHaveCount(0);
    const other = await page
      .getByRole("link", { name: "Chat on WhatsApp" })
      .first()
      .getAttribute("href");
    expect(decodeURIComponent(other ?? "")).toContain("Hello IncoTax team");
  });

  await test.step("one legal page, without changing the others", async () => {
    await page.goto("/admin/legal/privacy-policy");
    await page.getByLabel("Last updated", { exact: true }).fill("1 November 2026");
    await clearList(page, "section");
    await addRow(page, "section", {
      "Section 1 heading": "Data we collect",
      "Section 1 text": "First paragraph.\n\nSecond paragraph.",
      "Section 1 list": "Your name\nYour mobile number",
    });
    await saveHome(page);

    await page.goto("/privacy-policy");
    await expect(page.getByText("Last updated: 1 November 2026")).toBeVisible();
    await expect(page.getByRole("heading", { name: "1. Data we collect" })).toBeVisible();
    await expect(page.getByRole("link", { name: "1. Data we collect" })).toBeVisible();
    await expect(page.getByText("Second paragraph.")).toBeVisible();
    await expect(page.getByRole("article").getByRole("listitem")).toHaveCount(2);

    await page.goto("/disclaimer");
    await expect(page.getByText("Data we collect")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "1. [Section 1 heading]" })).toBeVisible();
  });

  await test.step("saving one section leaves the others saved", async () => {
    await saveFields(page, "/admin/contact", { "Page headline": "Reach the practice today" });
    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading", { name: "1. Data we collect" })).toBeVisible();
    await page.goto("/why-incotax");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Why people choose us");
  });
});
