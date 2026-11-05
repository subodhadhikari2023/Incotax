import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { ADMIN_TEST_PASSWORD } from "./admin-password";
import { expect, test } from "./test";

const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

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

test("the business details page needs a login", async ({ page }) => {
  await page.goto("/admin/business");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("the panel links to the business details form, which is accessible", async ({ page }) => {
  await logIn(page);
  await page.getByRole("link", { name: "Business details" }).click();
  await expect(page).toHaveURL(/\/admin\/business$/);
  await expect(page.getByRole("heading", { name: "Business details", level: 1 })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toHaveCount(0);

  const check = async () => {
    await expect(page).toHaveTitle("Admin | IncoTax Legal Services");
    const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(violations).toEqual([]);
  };
  await check();

  // An invalid value is never saved, so this doesn't disturb tests running alongside it.
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "email" })).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  await check();

  await page.getByRole("link", { name: "Back to panel" }).click();
  await expect(page).toHaveURL(/\/admin$/);
});

test("the home page editor needs a login", async ({ page }) => {
  await page.goto("/admin/home");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("the panel links to the home page form, which is accessible", async ({ page }) => {
  await logIn(page);
  await page.getByRole("link", { name: "Home page" }).click();
  await expect(page).toHaveURL(/\/admin\/home$/);
  await expect(page.getByRole("heading", { name: "Home page", level: 1 })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toHaveCount(0);

  const check = async () => {
    await expect(page).toHaveTitle("Admin | IncoTax Legal Services");
    const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(violations).toEqual([]);
  };
  await check();

  await page.getByRole("button", { name: "Add review" }).click();
  await expect(page.getByLabel("Review 1 text")).toBeVisible();
  await check();

  // An invalid value is never saved, so this doesn't disturb tests running alongside it.
  await page.getByLabel("Gold words in the headline").fill("Not in the headline");
  await page.getByLabel("Review 1 text").fill("Only the text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "headline" })).toBeVisible();
  await expect(page.getByLabel("Gold words in the headline")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByLabel("Review 1 name", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await check();
});

const editorPages = [
  { path: "/admin/site", link: "Site-wide text", heading: "Site-wide text" },
  { path: "/admin/why-incotax", link: "Why IncoTax", heading: "Why IncoTax" },
  { path: "/admin/contact", link: "Contact page", heading: "Contact page" },
];

for (const { path, link, heading } of editorPages) {
  test(`${path} needs a login, and the panel links to its accessible form`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);

    await logIn(page);
    await expect(page).toHaveURL(/\/admin$/);
    await page.getByRole("link", { name: link }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();

    await expect(page).toHaveTitle("Admin | IncoTax Legal Services");
    const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(violations).toEqual([]);
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
  await page.getByRole("link", { name: "Service pages" }).click();
  await expect(page).toHaveURL(/\/admin\/services$/);
  await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(16);

  await page.getByRole("link", { name: "GST Registration", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/services\/gst-registration$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("GST Registration");
  await expect(page).toHaveTitle("Admin | IncoTax Legal Services");
  const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
  expect(violations).toEqual([]);

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
  await page.getByRole("link", { name: "Legal pages" }).click();
  await expect(page).toHaveURL(/\/admin\/legal$/);
  await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(5);

  await page.getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page).toHaveURL(/\/admin\/legal\/privacy-policy$/);
  await page.getByRole("button", { name: "Add section" }).click();
  await expect(page).toHaveTitle("Admin | IncoTax Legal Services");
  const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
  expect(violations).toEqual([]);

  const missing = await page.goto("/admin/legal/no-such-page");
  expect(missing?.status()).toBe(404);
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
