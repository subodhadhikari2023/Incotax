import { describe, expect, it } from "vitest";

import { serviceCategories, services } from "./services";

describe("services content", () => {
  it("has the three categories from the services PDF, in order", () => {
    expect(serviceCategories.map((c) => c.name)).toEqual([
      "Registration",
      "Business Compliance & Taxation",
      "Business Licenses",
    ]);
  });

  it("lists all 16 services, each in a known category", () => {
    const categoryIds = serviceCategories.map((c) => c.id);
    expect(services).toHaveLength(16);
    for (const service of services) {
      expect(categoryIds).toContain(service.category);
    }
  });

  it("gives every service a unique, URL-safe slug", () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});
