import { routes } from "./routes";
import { expect, test } from "./test";

test("sitemap.xml lists every public page", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  for (const route of routes) {
    expect(xml, route).toContain(`<loc>${new URL(route, "http://localhost:3100").href}</loc>`);
  }
});

test("robots.txt allows crawling and points to the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toContain("Allow: /");
  expect(text).toContain("Sitemap: http://localhost:3100/sitemap.xml");
});

test("pages carry link-preview tags and the business's structured data", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Contact Us | IncoTax Legal Services",
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "IncoTax Legal Services",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "http://localhost:3100/contact",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3100/contact",
  );

  await page.goto("/");
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(jsonLd ?? "{}")).toMatchObject({
    "@type": "LegalService",
    name: "IncoTax Legal Services",
  });
});
