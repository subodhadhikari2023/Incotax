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

const frame = (page: Page) => page.frameLocator('iframe[title="Page preview"]');
const save = async (page: Page) => {
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toHaveText(/saved/i);
};
// Editing text the way an editor does: click it, then type. A field can show on the page twice.
const edit = async (page: Page, name: string, value: string) => {
  const box = frame(page).getByRole("textbox", { name, exact: true }).first();
  await box.click();
  await frame(page).getByRole("textbox", { name, exact: true }).first().fill(value);
};
const clearList = async (page: Page, row: string) => {
  const first = frame(page).getByRole("button", { name: `Remove ${row} 1`, exact: true });
  while (await first.count()) await first.click();
};
const addRow = async (page: Page, row: string, cells: Record<string, string>) => {
  await frame(page)
    .getByRole("button", { name: `Add ${row}`, exact: true })
    .click();
  for (const [name, value] of Object.entries(cells)) await edit(page, name, value);
};
const notOnPage = async (page: Page) => {
  const toggle = page.getByRole("button", { name: /not on the page/i });
  if ((await toggle.getAttribute("aria-expanded")) === "false") await toggle.click();
};

const details = {
  phone: "+91 90000 00000",
  email: "test@example.test",
  address: "1 Test Street, Patna",
  hours: "Monday to Saturday, 10 AM to 8 PM",
};
const labels = { phone: "Phone", email: "Email", address: "Office address", hours: "Hours" };

test("saved business details replace the placeholders across the public site", async ({ page }) => {
  test.setTimeout(120_000);
  await logIn(page);

  await test.step("start clean: blank fields fall back to the placeholders", async () => {
    await page.goto("/admin/business");
    for (const name of Object.values(labels)) await edit(page, name, "x");
    await notOnPage(page);
    await page.getByLabel("WhatsApp number").fill("919999999999");
    await expect(page.getByText("Unsaved changes", { exact: true })).toBeVisible();
    for (const name of Object.values(labels)) await edit(page, name, "");
    await page.getByLabel("WhatsApp number").fill("");
    await save(page);
    await page.goto("/");
    await expect(page.getByText("[Phone number]").first()).toBeVisible();
  });

  await test.step("an invalid value is refused and nothing changes", async () => {
    await page.goto("/admin/business");
    await edit(page, "Email", "not-an-email");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(frame(page).getByRole("alert").filter({ hasText: "email" }).first()).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);

    await page.goto("/admin/business");
    await expect(frame(page).getByRole("textbox", { name: "Email" }).first()).toHaveText("");
  });

  await test.step("saving keeps the values on the page", async () => {
    await page.goto("/admin/business");
    for (const [field, name] of Object.entries(labels)) {
      await edit(page, name, details[field as keyof typeof details]);
    }
    await notOnPage(page);
    await page.getByLabel("WhatsApp number").fill("+91 90000-00000");
    await save(page);
    await expect(page.getByLabel("WhatsApp number")).toHaveValue("919000000000");
    await page.goto("/admin/business");
    await expect(frame(page).getByRole("textbox", { name: "Phone" }).first()).toHaveText(
      details.phone,
    );
    // The top bar, footer and contact list all show the one saved value.
    await expect(frame(page).getByRole("textbox", { name: "Phone" })).toHaveCount(3);
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
    await page.goto("/admin/business");
    for (const name of Object.values(labels)) await edit(page, name, "");
    await notOnPage(page);
    await page.getByLabel("WhatsApp number").fill("");
    await save(page);
    await page.goto("/");
    await expect(page.getByText("[Phone number]").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Chat on WhatsApp" }).first()).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/(\?|$)/,
    );
  });
});

test("the home page is edited in place and shows on the public site", async ({ page }) => {
  test.setTimeout(150_000);
  await logIn(page);
  await page.goto("/admin/home");

  await test.step("edit the text and lists on the page", async () => {
    await edit(page, "Label above the headline", "Trusted advisers");
    await edit(page, "Headline", "Build Your Business Right");
    await edit(page, "Supporting text", "Support text for the hero");
    await edit(page, "Services intro", "Services line");
    await edit(page, "How it works heading", "How we work");
    await edit(page, "How it works intro", "Process line");
    await edit(page, "Fees intro", "Clear fees");
    await edit(page, "Featured plan tag", "Most chosen");
    await edit(page, "Reviews intro", "Reviews line");
    await notOnPage(page);
    await page.getByLabel("Gold words in the headline").fill("Business Right");

    await clearList(page, "stat");
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

    // A change shows at once on the page being edited, before any save.
    const fees = frame(page).getByRole("region", { name: "Fees" });
    await expect(fees.getByText("Name approval")).toHaveCount(3);
    await save(page);
  });

  await test.step("the page keeps what was saved", async () => {
    await page.goto("/admin/home");
    await expect(frame(page).locator("h1 em")).toHaveText("Business Right");
    await expect(frame(page).getByRole("textbox", { name: "Client 2 name" })).toHaveText(
      "Beta Stores",
    );
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

  await test.step("a mistake is refused and nothing changes", async () => {
    await page.goto("/admin/home");
    await notOnPage(page);
    await page.getByLabel("Gold words in the headline").fill("Not there");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "headline" })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);

    await page.goto("/");
    await expect(page.locator("h1 em")).toHaveText("Business Right");
  });

  await test.step("empty lists hide their sections; the rest of the page stays", async () => {
    await page.goto("/admin/home");
    for (const row of ["stat", "client", "step", "fee highlight", "review"]) {
      await clearList(page, row);
    }
    await expect(
      frame(page)
        .getByText(/hidden on the site/i)
        .first(),
    ).toBeVisible();
    await save(page);

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

  await test.step("clearing text brings its placeholder back", async () => {
    await page.goto("/admin/home");
    await edit(page, "Label above the headline", "");
    await save(page);

    await page.goto("/");
    await expect(page.getByText("[Short label above the headline]")).toBeVisible();
  });
});

test("the other pages are edited in place", async ({ page }) => {
  test.setTimeout(150_000);
  await logIn(page);

  await test.step("site-wide text reaches the WhatsApp band, buttons, forms and pop-up", async () => {
    await page.goto("/admin/site");
    await edit(page, "WhatsApp band heading", "Talk to us today");
    await edit(page, "WhatsApp band line", "Tap the button below");
    await edit(page, "Intro above what a service covers", "Everything included");
    await edit(page, "Intro above other services", "You may also need");
    await edit(page, "Form submit button", "Send enquiry");
    await edit(page, "Note under the contact form", "We reply within a day");
    await edit(page, "Pop-up heading", "Tell us what you need");
    await notOnPage(page);
    await page.getByLabel("Default WhatsApp message").fill("Hello IncoTax team");
    await save(page);

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
    await edit(page, "Page headline", "Why people choose us");
    await edit(page, "Zeeshan Khan bio", "An updated biography");
    await addRow(page, "about paragraph", { "About paragraph 1": "We started in Patna." });
    await clearList(page, "court");
    await addRow(page, "court", { "Court 1": "Supreme Court of India" });
    await save(page);

    await page.goto("/why-incotax");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Why people choose us");
    await expect(page.getByText("An updated biography")).toBeVisible();
    await expect(page.getByText("We started in Patna.")).toBeVisible();
    await expect(page.getByText("Supreme Court of India")).toBeVisible();
    await expect(page.getByText("High Court of Patna")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Zeeshan Khan" })).toBeVisible();
  });

  await test.step("Contact page", async () => {
    await page.goto("/admin/contact");
    await edit(page, "Page headline", "Reach the practice");
    await edit(page, "Form heading", "Write to the team");
    await save(page);

    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reach the practice");
    await expect(page.getByRole("heading", { name: "Write to the team" })).toBeVisible();
  });

  await test.step("one service, without changing the others", async () => {
    await page.goto("/admin/services/gst-registration");
    await edit(page, "Short description", "Register for GST without the paperwork");
    await edit(page, "Overview paragraph two", "We handle the filing for you");
    await notOnPage(page);
    await page
      .getByLabel("WhatsApp message", { exact: true })
      .fill("Hello, I need GST registration");
    await save(page);

    await page.goto("/admin/home");
    await edit(page, "GST Registration card description", "GST registration, done for you");
    await save(page);

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
    await edit(page, "Last updated", "1 November 2026");
    await addRow(page, "section", {
      "Section 1 heading": "Data we collect",
      "Section 1 text": "First paragraph.\n\nSecond paragraph.",
      "Section 1 list": "Your name\nYour mobile number",
    });
    await save(page);

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
    await page.goto("/admin/contact");
    await edit(page, "Page headline", "Reach the practice today");
    await save(page);
    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading", { name: "1. Data we collect" })).toBeVisible();
    await page.goto("/why-incotax");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Why people choose us");
  });
});
