import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { ADMIN_TEST_PASSWORD } from "./admin-password";
import { expect, test } from "./test";

const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const adminNav = (page: Page) => page.getByRole("navigation", { name: "Admin sections" });

async function logIn(page: Page, password = ADMIN_TEST_PASSWORD) {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

test("the panel redirects to the login page when not logged in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Admin login", level: 1 })).toBeVisible();
});

test("a forged session cookie does not open the panel", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "incotax_admin",
      value: `9999999999999.${"0".repeat(64)}`,
      domain: "localhost",
      path: "/admin",
    },
  ]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("a wrong password shows an error and sets no cookie", async ({ page, context }) => {
  await logIn(page, "not-the-password");
  await expect(page.getByRole("alert").filter({ hasText: "password" })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(await context.cookies()).toEqual([]);
});

test("the right password opens the panel with an HTTP-only cookie", async ({ page, context }) => {
  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin panel", level: 1 })).toBeVisible();

  const cookies = await context.cookies();
  expect(cookies).toHaveLength(1);
  expect(cookies[0]).toMatchObject({
    name: "incotax_admin",
    httpOnly: true,
    sameSite: "Lax",
    path: "/admin",
  });
});

test("the login page sends a logged-in admin to the panel", async ({ page }) => {
  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/admin$/);
});

test("logging out closes the panel", async ({ page, context }) => {
  await logIn(page);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(await context.cookies()).toEqual([]);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("admin pages are hidden from search engines and have no public header or footer", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("banner")).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);

  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
});

test("the login flow loads only the site's own files and breaks no CSP rule", async ({ page }) => {
  const outside: string[] = [];
  const cspErrors: string[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (["http:", "https:"].includes(url.protocol) && url.host !== "localhost:3100") {
      outside.push(req.url());
    }
  });
  page.on("console", (msg) => {
    if (msg.type() === "error" && /Content Security Policy/i.test(msg.text())) {
      cspErrors.push(msg.text());
    }
  });

  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  expect(outside).toEqual([]);
  expect(cspErrors).toEqual([]);
});

test("no accessibility violations on the login page, its error state or the panel", async ({
  page,
}) => {
  const check = async () => {
    // After the login redirect the heading can appear just before the browser updates the title.
    await expect(page).toHaveTitle("Admin | IncoTax Legal Services");
    const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(violations).toEqual([]);
  };

  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Admin login", level: 1 })).toBeVisible();
  await check();

  await logIn(page, "not-the-password");
  await expect(page.getByRole("alert").filter({ hasText: "password" })).toBeVisible();
  await check();

  await logIn(page);
  await expect(page.getByRole("heading", { name: "Admin panel", level: 1 })).toBeVisible();
  await check();
});

const frame = (page: Page) => page.frameLocator('iframe[title="Page preview"]');
const openFromOverview = async (page: Page, name: string) => {
  await page.getByRole("main").getByRole("link", { name }).click();
};

const axeCheck = async (page: Page) => {
  await expect(page).toHaveTitle("Admin | IncoTax Legal Services");
  const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
  expect(violations).toEqual([]);
};

const editors = [
  { path: "/admin/home", link: "Home page", field: "Headline", live: "/" },
  { path: "/admin/why-incotax", link: "Why IncoTax", field: "Page headline", live: "/why-incotax" },
  { path: "/admin/contact", link: "Contact page", field: "Page headline", live: "/contact" },
  { path: "/admin/business", link: "Business details", field: "Phone", live: "/contact" },
  { path: "/admin/site", link: "Site-wide text", field: "WhatsApp band heading", live: "/" },
];

for (const { path, link, field, live } of editors) {
  test(`${path} needs a login, opens the real page to edit and is accessible`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);

    await logIn(page);
    await expect(page).toHaveURL(/\/admin$/);
    await openFromOverview(page, link);
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(link);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);

    // The page's own header and footer are in the frame, drawn by the site's own components.
    await expect(frame(page).getByRole("banner")).toBeVisible();
    await expect(frame(page).getByRole("contentinfo")).toBeVisible();
    await expect(
      frame(page).getByRole("textbox", { name: field, exact: true }).first(),
    ).toBeVisible();

    const view = page.getByRole("link", { name: "View live page" });
    await expect(view).toHaveAttribute("href", live);
    await expect(view).toHaveAttribute("target", "_blank");
    await axeCheck(page);
  });
}

test("the service editors need a login, list all 16 services and are accessible", async ({
  page,
}) => {
  await page.goto("/admin/services");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/services/gst-registration");
  await expect(page).toHaveURL(/\/admin\/login$/);

  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await adminNav(page).getByRole("link", { name: "Service pages" }).click();
  await expect(page).toHaveURL(/\/admin\/services$/);
  await expect(page.getByRole("main").locator("ul > li")).toHaveCount(16);

  await page.getByRole("link", { name: "GST Registration", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/services\/gst-registration$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("GST Registration");
  await expect(frame(page).getByRole("heading", { level: 1 })).toHaveText("GST Registration");
  await expect(frame(page).getByRole("textbox", { name: "Short description" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View live page" })).toHaveAttribute(
    "href",
    "/services/gst-registration",
  );
  await axeCheck(page);

  const missing = await page.goto("/admin/services/no-such-service");
  expect(missing?.status()).toBe(404);
});

test("the legal editors need a login, list all 5 pages and are accessible", async ({ page }) => {
  await page.goto("/admin/legal");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/legal/privacy-policy");
  await expect(page).toHaveURL(/\/admin\/login$/);

  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await adminNav(page).getByRole("link", { name: "Legal pages" }).click();
  await expect(page).toHaveURL(/\/admin\/legal$/);
  await expect(page.getByRole("main").locator("ul > li")).toHaveCount(5);

  await page.getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page).toHaveURL(/\/admin\/legal\/privacy-policy$/);
  await frame(page).getByRole("button", { name: "Add section" }).click();
  await expect(frame(page).getByRole("textbox", { name: "Section 1 heading" })).toBeFocused();
  await axeCheck(page);

  const missing = await page.goto("/admin/legal/no-such-page");
  expect(missing?.status()).toBe(404);
});

test("the home editor draws the same page visitors see, and a refused edit is marked on it", async ({
  page,
}) => {
  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/home");

  const site = frame(page);
  await expect(site.getByRole("heading", { name: "Our Services" })).toBeVisible();
  await expect(site.getByRole("heading", { name: "Fees" })).toBeVisible();
  await expect(site.getByText("₹3,499").first()).toBeVisible();

  // Built styles really reach the frame: the hero is navy and the headline uses the heading font.
  const hero = site.getByRole("region", { name: "Introduction" });
  await expect(hero).toHaveCSS("background-color", "rgb(11, 31, 58)");
  await expect(site.getByRole("heading", { level: 1 })).toHaveCSS("font-family", /cormorant/i);

  // Nothing here is saved, so this doesn't disturb tests running alongside it.
  const before = page.url();
  await site.getByRole("link", { name: "Chat on WhatsApp" }).first().click({ force: true });
  await expect(page.getByText(/links don't open while you edit/i)).toBeVisible();
  expect(page.url()).toBe(before);

  await site.getByRole("button", { name: "Add review" }).click();
  await site.getByRole("textbox", { name: "Review 1 text" }).fill("Only the text");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Please fix the 1 field marked in red.")).toBeVisible();
  await expect(site.getByRole("textbox", { name: "Review 1 name" })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(site.getByRole("textbox", { name: "Review 1 name" })).toBeFocused();
  await axeCheck(page);
});

test("the phone view really uses the site's phone layout", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "The switch matters when the window itself is wide.");
  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/home");

  const site = frame(page);
  const statTops = () =>
    site
      .getByRole("region", { name: "Introduction" })
      .getByRole("listitem")
      .evaluateAll((items) => items.map((el) => Math.round(el.getBoundingClientRect().top)));

  await expect.poll(async () => new Set(await statTops()).size).toBe(1);
  await page.getByRole("button", { name: "Phone" }).click();
  await expect.poll(async () => new Set(await statTops()).size).toBe(2);
  await expect(site.getByRole("button", { name: "Open menu" })).toBeVisible();
});

test("unsaved work is protected", async ({ page }) => {
  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/home");
  const headline = frame(page).getByRole("textbox", { name: "Headline", exact: true });

  await expect(page.getByText("No unsaved changes")).toBeVisible();
  await headline.click();
  await headline.fill("Not saved");
  await expect(page.getByText("Unsaved changes", { exact: true })).toBeVisible();

  const back = page.getByRole("link", { name: "Admin panel" });
  page.once("dialog", (dialog) => dialog.dismiss());
  await back.click();
  await expect(page).toHaveURL(/\/admin\/home$/);
  await expect(headline).toHaveText("Not saved");

  page.once("dialog", (dialog) => dialog.accept());
  await back.click();
  await expect(page).toHaveURL(/\/admin$/);
});

test("admin pages fit the screen without sideways scrolling", async ({ page }) => {
  await logIn(page);
  await expect(page).toHaveURL(/\/admin$/);

  for (const path of ["/admin", "/admin/home", "/admin/services", "/admin/legal/privacy-policy"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

// Guards for moving the public pages into their own layout: both pass before and after the move.
test("an unknown URL still shows the 404 page with the public header and footer", async ({
  page,
}) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
});

test("the sitemap does not list the admin pages", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).not.toContain("/admin");
});
