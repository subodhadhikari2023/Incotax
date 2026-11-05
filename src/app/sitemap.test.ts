import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { services } from "@/content/services";
import { legalLinks } from "@/content/site";

import robots from "./robots";
import sitemap from "./sitemap";

vi.mock("@/lib/content-store", () => ({ readStoredContent: vi.fn(async () => stored.content) }));
const stored = vi.hoisted(() => ({ content: {} as Record<string, unknown> }));

describe("sitemap and robots", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_URL", "https://example.test");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("leaves out hidden services and drafts, and lists published additions", async () => {
    stored.content = {
      serviceCatalog: {
        hidden: ["gst-registration"],
        added: [
          { slug: "tax-audit", name: "Tax Audit", category: "registration", published: true },
          { slug: "new-idea", name: "New Idea", category: "registration", published: false },
        ],
      },
    };
    const urls = (await sitemap()).map((entry) => entry.url);
    stored.content = {};
    expect(urls).toContain("https://example.test/services/tax-audit");
    expect(urls).not.toContain("https://example.test/services/new-idea");
    expect(urls).not.toContain("https://example.test/services/gst-registration");
  });

  it("lists home, Why IncoTax, Contact, all 16 services and the 5 legal pages", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
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
