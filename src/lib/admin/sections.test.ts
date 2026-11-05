// @vitest-environment node
import { describe, expect, it } from "vitest";

import { activeSection, adminSections } from "./sections";

describe("adminSections", () => {
  it("lists the pages first, then what is shared across the site", () => {
    expect(adminSections.map((section) => [section.group, section.label])).toEqual([
      ["Pages", "Home page"],
      ["Pages", "Why IncoTax"],
      ["Pages", "Contact page"],
      ["Pages", "Service pages"],
      ["Pages", "Legal pages"],
      ["Across the site", "Business details"],
      ["Across the site", "Site-wide text"],
    ]);
  });

  it("says in plain words what each section changes", () => {
    for (const section of adminSections) {
      expect(section.description.length, section.label).toBeGreaterThan(20);
      expect(section.href, section.label).toMatch(/^\/admin\//);
    }
  });
});

describe("activeSection", () => {
  it("finds the section for its own page and the pages under it", () => {
    expect(activeSection("/admin/home")?.label).toBe("Home page");
    expect(activeSection("/admin/services")?.label).toBe("Service pages");
    expect(activeSection("/admin/services/gst-registration")?.label).toBe("Service pages");
    expect(activeSection("/admin/legal/privacy-policy")?.label).toBe("Legal pages");
  });

  it("finds nothing on the panel home", () => {
    expect(activeSection("/admin")).toBeUndefined();
  });

  it("does not match a page that only starts with the same letters", () => {
    expect(activeSection("/admin/homework")).toBeUndefined();
  });
});
