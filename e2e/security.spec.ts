import { routes } from "./routes";
import { expect, test } from "./test";

test("responses carry the security headers", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["strict-transport-security"]).toContain("max-age=");
});

// Fonts, icons and styles are installed packages served by the site itself: no page may load
// anything from another host, and the CSP must not block anything the page needs.
test("every page loads only its own files and breaks no CSP rule", async ({ page }) => {
  const outside: string[] = [];
  const cspErrors: string[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (!["http:", "https:"].includes(url.protocol)) return;
    if (url.host !== "localhost:3100") outside.push(req.url());
  });
  page.on("console", (msg) => {
    if (msg.type() === "error" && /Content Security Policy/i.test(msg.text())) {
      cspErrors.push(msg.text());
    }
  });

  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
  }

  expect(outside).toEqual([]);
  expect(cspErrors).toEqual([]);
});
