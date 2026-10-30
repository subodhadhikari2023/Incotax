import { afterEach, describe, expect, it, vi } from "vitest";

import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses SITE_URL when it is set", () => {
    vi.stubEnv("SITE_URL", "https://example.test/");
    vi.stubEnv("URL", "https://netlify.example");
    expect(siteUrl()).toBe("https://example.test");
  });

  it("falls back to Netlify's URL (the site's main domain) at build time", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("URL", "https://netlify.example");
    expect(siteUrl()).toBe("https://netlify.example");
  });

  it("falls back to the local dev server otherwise", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("URL", "");
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});
