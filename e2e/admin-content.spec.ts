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

// A real 4x5 PNG, small enough to keep in the test.
const PHOTO = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAFCAIAAADtz9qMAAAAEElEQVR4nGPglreCIwYyOAD6fQfRAXL/QAAAAABJRU5ErkJggg==",
  "base64",
);

test("a founder's photo is previewed on the page, then published, replaced and removed", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await logIn(page);
  await page.goto("/admin/why-incotax");

  const choose = () =>
    frame(page)
      .getByLabel("Upload a photo of Zeeshan Khan")
      .setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PHOTO });
  const shown = async (image: ReturnType<Page["getByRole"]>) => {
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  };

  await test.step("a chosen photo shows on the page before it is saved", async () => {
    await choose();
    await expect(frame(page).getByRole("img", { name: "Zeeshan Khan" })).toHaveAttribute(
      "src",
      /^blob:/,
    );
    await expect(page.getByText("Unsaved changes", { exact: true })).toBeVisible();

    const live = await page.context().newPage();
    await live.goto("/why-incotax");
    await expect(live.getByRole("img", { name: "Zeeshan Khan" })).toHaveCount(0);
    await live.close();
  });

  let firstAddress = "";
  await test.step("saving publishes it, on the real image address", async () => {
    await save(page);
    await page.goto("/why-incotax");
    const image = page.getByRole("img", { name: "Zeeshan Khan" });
    await shown(image);
    firstAddress = (await image.getAttribute("src")) ?? "";
    await expect(page.getByText("[Professional photo]")).toHaveCount(1);

    const response = await page.request.get("/media/founder-0");
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  await test.step("replacing it changes the address, so no old copy is shown", async () => {
    await page.goto("/admin/why-incotax");
    await expect(frame(page).getByText("Replace photo")).toBeVisible();
    await choose();
    await save(page);
    await page.goto("/why-incotax");
    const image = page.getByRole("img", { name: "Zeeshan Khan" });
    await shown(image);
    expect(await image.getAttribute("src")).not.toBe(firstAddress);
  });

  await test.step("removing it brings the placeholder back", async () => {
    await page.goto("/admin/why-incotax");
    await frame(page).getByRole("button", { name: "Remove photo of Zeeshan Khan" }).click();
    await save(page);
    await page.goto("/why-incotax");
    await expect(page.getByRole("img", { name: "Zeeshan Khan" })).toHaveCount(0);
    await expect(page.getByText("[Professional photo]")).toHaveCount(2);
    expect((await page.request.get("/media/founder-0")).status()).toBe(404);
  });
});

test("everything on a service page can be edited, including prices", async ({ page }) => {
  test.setTimeout(150_000);
  await logIn(page);

  await test.step("a fixed fee, with new wording, on a page without plans", async () => {
    await page.goto("/admin/services/section-8-company-registration");
    await frame(page).getByLabel("How this fee is shown").selectOption("fixed");
    await edit(page, "Fee amount", "12,500");
    await edit(page, "Estimated timeline", "About two weeks");
    await edit(page, "Please note", "Stamp duty is extra");
    await edit(page, "Not included", "Government fees");
    await edit(page, "Included item 1 name", "Reworded item");
    await edit(page, "Included item 1 description", "Reworded description");
    await frame(page).getByRole("button", { name: "Remove included item 2", exact: true }).click();
    await addRow(page, "included item", {});
    const added = frame(page)
      .getByRole("textbox", { name: /^Included item \d+ name$/ })
      .last();
    await added.fill("A brand new item");
    await save(page);

    await page.goto("/services/section-8-company-registration");
    await expect(page.getByText("Fixed fee")).toBeVisible();
    await expect(page.getByText("₹12,500")).toBeVisible();
    await expect(page.getByText("About two weeks")).toBeVisible();
    await expect(page.getByText("Stamp duty is extra")).toBeVisible();
    await expect(page.getByText("Not included: Government fees")).toBeVisible();
    await expect(page.getByText("Reworded item")).toBeVisible();
    await expect(page.getByText("A brand new item")).toBeVisible();
  });

  await test.step("a wrong price is refused on the page", async () => {
    await page.goto("/admin/services/section-8-company-registration");
    await edit(page, "Fee amount", "twelve");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(frame(page).getByRole("alert").filter({ hasText: "number" })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);

    await page.goto("/services/section-8-company-registration");
    await expect(page.getByText("₹12,500")).toBeVisible();
  });

  await test.step("plan prices reach the service page and the home page fee cards", async () => {
    await page.goto("/admin/services/private-limited-company-incorporation");
    await edit(page, "Basic price", "1,999");
    await frame(page).getByLabel("Item 1 in Basic").uncheck();
    await save(page);

    await page.goto("/services/private-limited-company-incorporation");
    await expect(page.getByText("Starting from")).toBeVisible();
    await expect(page.getByText("₹1,999").first()).toBeVisible();
    await expect(page.getByText("Included in: Standard, Premium").first()).toBeVisible();

    await page.goto("/");
    const fees = page.getByRole("region", { name: "Fees" });
    await expect(fees.getByText("₹1,999")).toBeVisible();
    await expect(fees.getByText("₹1,499")).toHaveCount(0);
  });

  await test.step("other services keep their own details", async () => {
    await page.goto("/services/llp-registration");
    await expect(page.getByText("₹1,499").first()).toBeVisible();
  });
});

test("a service is added as a draft, published, renamed, hidden and restored", async ({ page }) => {
  test.setTimeout(180_000);
  await logIn(page);

  const card = (name: string) =>
    page.getByRole("main").locator("ul > li").filter({ hasText: name });
  const menuHas = async (name: string, count: number) => {
    await page.goto("/contact");
    await expect(page.getByRole("option", { name, exact: true })).toHaveCount(count);
  };

  await test.step("a mistake is explained, and nothing is created", async () => {
    await page.goto("/admin/services");
    await page.getByLabel("Name of the new service").fill("GST Registration");
    await page.getByRole("button", { name: "Add service" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "already" })).toBeVisible();
    expect(page.url()).toMatch(/\/admin\/services$/);
  });

  await test.step("a new service opens as a draft on the page design", async () => {
    await page.getByLabel("Name of the new service").fill("Tax Audit");
    await page.getByLabel("Category").selectOption("compliance-taxation");
    await page.getByRole("button", { name: "Add service" }).click();
    await expect(page).toHaveURL(/\/admin\/services\/tax-audit$/);
    await expect(page.getByText(/draft/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "View live page" })).toHaveCount(0);
    await edit(page, "Short description", "An audit of your accounts");
    await save(page);
  });

  await test.step("a draft is not public", async () => {
    const response = await page.goto("/services/tax-audit");
    expect(response?.status()).toBe(404);
    await menuHas("Tax Audit", 0);
    const sitemap = await (await page.request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("tax-audit");
  });

  await test.step("publishing puts it everywhere", async () => {
    await page.goto("/admin/services/tax-audit");
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText(/draft/i)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "View live page" })).toBeVisible();

    await page.goto("/services/tax-audit");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tax Audit");
    await expect(page.getByText("An audit of your accounts")).toBeVisible();
    await menuHas("Tax Audit", 1);
    const sitemap = await (await page.request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/services/tax-audit");
  });

  await test.step("renaming keeps the address", async () => {
    await page.goto("/admin/services/tax-audit");
    await edit(page, "Service name", "Statutory Audit");
    await save(page);

    const response = await page.goto("/services/tax-audit");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Statutory Audit");
    await menuHas("Statutory Audit", 1);
  });

  await test.step("choosing what shows on the home page", async () => {
    await page.goto("/admin/services");
    await card("Statutory Audit")
      .getByRole("button", { name: /add .* to the home page/i })
      .click();
    await expect(
      card("Statutory Audit").getByRole("button", { name: /take .* off the home page/i }),
    ).toBeVisible();

    await page.goto("/");
    await expect(
      page.locator("#services").getByRole("heading", { name: "Statutory Audit" }),
    ).toBeVisible();
    await expect(page.locator("#services").getByRole("link", { name: /Learn more/ })).toHaveCount(
      7,
    );
  });

  await test.step("hiding takes it off the site and old links go to the services", async () => {
    await page.goto("/admin/services");
    await card("Statutory Audit").getByRole("button", { name: /^Hide/ }).click();
    await expect(card("Statutory Audit").getByRole("button", { name: /^Restore/ })).toBeVisible();
    await expect(card("Statutory Audit")).toContainText("Hidden");

    await page.goto("/services/tax-audit");
    await expect(page).toHaveURL(/\/#services$/);
    await expect(
      page.locator("#services").getByRole("heading", { name: "Statutory Audit" }),
    ).toHaveCount(0);
    await menuHas("Statutory Audit", 0);
  });

  await test.step("restoring brings it back, with its text", async () => {
    await page.goto("/admin/services");
    await card("Statutory Audit")
      .getByRole("button", { name: /^Restore/ })
      .click();
    await expect(card("Statutory Audit").getByRole("button", { name: /^Hide/ })).toBeVisible();

    const response = await page.goto("/services/tax-audit");
    expect(response?.status()).toBe(200);
    await expect(page.getByText("An audit of your accounts")).toBeVisible();
  });

  await test.step("a service from the original list can be hidden too", async () => {
    await page.goto("/admin/services");
    await card("ISO Certification").getByRole("button", { name: /^Hide/ }).click();
    await expect(card("ISO Certification").getByRole("button", { name: /^Restore/ })).toBeVisible();
    await menuHas("ISO Certification", 0);
    await page.goto("/admin/services");
    await card("ISO Certification")
      .getByRole("button", { name: /^Restore/ })
      .click();
    await expect(card("ISO Certification").getByRole("button", { name: /^Hide/ })).toBeVisible();
    await menuHas("ISO Certification", 1);
  });

  await test.step("an unpublished draft can be deleted for good", async () => {
    await page.goto("/admin/services");
    await page.getByLabel("Name of the new service").fill("Changed My Mind");
    await page.getByRole("button", { name: "Add service" }).click();
    await expect(page).toHaveURL(/\/admin\/services\/changed-my-mind$/);

    await page.goto("/admin/services");
    page.once("dialog", (dialog) => dialog.accept());
    await card("Changed My Mind")
      .getByRole("button", { name: /^Delete/ })
      .click();
    await expect(card("Changed My Mind")).toHaveCount(0);
    await expect(card("Statutory Audit").getByRole("button", { name: /^Delete/ })).toHaveCount(0);
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
