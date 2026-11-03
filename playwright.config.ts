import { tmpdir } from "node:os";
import { join } from "node:path";

import { defineConfig, devices } from "@playwright/test";

import { ADMIN_TEST_PASSWORD } from "./e2e/admin-password";
import { hashPassword } from "./src/lib/admin/password";

// E2E tests run against a production build (what Netlify serves) on port 3100,
// so they never collide with the dev server on port 3000.
const PORT = 3100;

// Saved content for the test server; removed before each build so pages start from the defaults.
const CONTENT_STORE_FILE = join(tmpdir(), "incotax-e2e-content.json");

// This spec changes what every public page shows, so nothing may run alongside it.
const CONTENT_EDITING_SPEC = /admin-content\.spec\.ts/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never", host: "0.0.0.0", port: 9323 }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  // The three widths the design was drawn at.
  projects: [
    {
      name: "desktop",
      testIgnore: CONTENT_EDITING_SPEC,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "tablet",
      testIgnore: CONTENT_EDITING_SPEC,
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 }, hasTouch: true },
    },
    {
      name: "phone",
      testIgnore: CONTENT_EDITING_SPEC,
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "content-editing",
      testMatch: CONTENT_EDITING_SPEC,
      dependencies: ["desktop", "tablet", "phone"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `rm -f "${CONTENT_STORE_FILE}" && npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    // Absolute URLs (sitemap, canonical, Open Graph) point at the test server.
    env: {
      SITE_URL: `http://localhost:${PORT}`,
      // Throwaway admin login for the test server.
      ADMIN_PASSWORD_HASH: hashPassword(ADMIN_TEST_PASSWORD),
      ADMIN_SESSION_SECRET: "e2e-test-signing-secret",
      CONTENT_STORE_FILE,
    },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
