import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { services } from "@/content/services";
import { legalLinks } from "@/content/site";

import robots from "./robots";
import sitemap from "./sitemap";

describe("sitemap and robots", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_URL", "https://example.test");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("lists home, Why IncoTax, Contact, all 16 services and the 5 legal pages", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain("https://example.test/");
    expect(urls).toContain("https://example.test/why-incotax");
    expect(urls).toContain("https://example.test/contact");
    for (const service of services) {
      expect(urls).toContain(`https://example.test/services/${service.slug}`);
    }
    for (const link of legalLinks) {
      expect(urls).toContain(`https://example.test${link.href}`);
    }
    expect(urls).toHaveLength(3 + services.length + legalLinks.length);
  });

  it("lets every crawler in and points to the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://example.test/sitemap.xml",
    });
  });
});
