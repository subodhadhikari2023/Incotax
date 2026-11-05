// @vitest-environment node
import { describe, expect, it } from "vitest";

import { home } from "@/content/home";
import { services } from "@/content/services";

import {
  addService,
  catalogEntry,
  deleteDraft,
  groupByCategory,
  hideService,
  homeServiceSlugs,
  nextSlug,
  otherServicesFrom,
  publicServices,
  publishService,
  restoreService,
  allCatalogEntries,
  toggleHomeService,
  MAX_HOME_SERVICES,
} from "./service-catalog";

const added = {
  serviceCatalog: {
    added: [
      { slug: "tax-audit", name: "Tax Audit", category: "compliance-taxation", published: true },
      { slug: "new-idea", name: "New Idea", category: "registration", published: false },
    ],
  },
};

describe("publicServices", () => {
  it("is the code's services when nothing is saved", () => {
    expect(publicServices({})).toEqual(services);
  });

  it("adds published services but not drafts", () => {
    const slugs = publicServices(added).map((service) => service.slug);
    expect(slugs).toContain("tax-audit");
    expect(slugs).not.toContain("new-idea");
  });

  it("leaves out hidden services", () => {
    const slugs = publicServices({
      serviceCatalog: { hidden: ["gst-registration"] },
    }).map((service) => service.slug);
    expect(slugs).not.toContain("gst-registration");
    expect(slugs).toHaveLength(services.length - 1);
  });

  it("uses a saved name, while the address stays the same", () => {
    const service = publicServices({
      "services/gst-registration": { name: "GST Sign-up" },
    }).find((each) => each.slug === "gst-registration");
    expect(service?.name).toBe("GST Sign-up");
    expect(service?.shortName).toBeUndefined();
  });

  it.each([
    { serviceCatalog: "text" },
    { serviceCatalog: null },
    { serviceCatalog: { added: "x", hidden: 5 } },
    {
      serviceCatalog: {
        added: [null, { slug: 5 }, { slug: "a" }, { slug: "a", name: "A", category: "nope" }],
      },
    },
  ])("ignores stored data of the wrong shape: %j", (content) => {
    expect(publicServices(content)).toEqual(services);
  });
});

describe("catalogEntry", () => {
  it("says what state a service is in", () => {
    expect(catalogEntry({}, "gst-registration")?.status).toBe("published");
    expect(catalogEntry(added, "tax-audit")?.status).toBe("published");
    expect(catalogEntry(added, "new-idea")?.status).toBe("draft");
    expect(
      catalogEntry({ serviceCatalog: { hidden: ["gst-registration"] } }, "gst-registration")
        ?.status,
    ).toBe("hidden");
  });

  it("knows nothing of an address never created", () => {
    expect(catalogEntry(added, "no-such-service")).toBeUndefined();
  });
});

describe("allCatalogEntries", () => {
  it("lists every service for the panel, whatever its state", () => {
    const content = { serviceCatalog: { ...added.serviceCatalog, hidden: ["llp-registration"] } };
    const entries = allCatalogEntries(content);
    expect(entries).toHaveLength(services.length + 2);
    expect(entries.find((entry) => entry.slug === "llp-registration")?.status).toBe("hidden");
  });
});

describe("nextSlug", () => {
  it("makes an address from the name", () => {
    expect(nextSlug("Tax Audit & Filing (2026)", [])).toBe("tax-audit-filing-2026");
  });

  it("never reuses an address, so old links can't point at the wrong service", () => {
    expect(nextSlug("GST Registration", ["gst-registration"])).toBe("gst-registration-2");
    expect(nextSlug("GST Registration", ["gst-registration", "gst-registration-2"])).toBe(
      "gst-registration-3",
    );
  });

  it("has an answer for a name with no usable letters", () => {
    expect(nextSlug("!!!", [])).toBe("service");
  });
});

describe("addService", () => {
  it("adds a draft, with an address that does not clash", () => {
    const { content, slug } = addService({}, "GST Registration", "registration");
    expect(slug).toBe("gst-registration-2");
    expect(catalogEntry(content, slug)).toMatchObject({
      name: "GST Registration",
      category: "registration",
      status: "draft",
    });
    expect(publicServices(content)).toEqual(services);
  });

  it("keeps what was already saved", () => {
    const { content } = addService(
      { business: { phone: "1" }, ...added },
      "Another",
      "registration",
    );
    expect(content.business).toEqual({ phone: "1" });
    expect(catalogEntry(content, "tax-audit")).toBeDefined();
  });
});

describe("publishService, hideService and restoreService", () => {
  it("publishes a draft", () => {
    const content = publishService(added, "new-idea");
    expect(catalogEntry(content, "new-idea")?.status).toBe("published");
    expect(publicServices(content).map((service) => service.slug)).toContain("new-idea");
  });

  it("hides and restores a service from the code", () => {
    const hidden = hideService({}, "gst-registration");
    expect(catalogEntry(hidden, "gst-registration")?.status).toBe("hidden");
    expect(
      catalogEntry(restoreService(hidden, "gst-registration"), "gst-registration")?.status,
    ).toBe("published");
  });

  it("hides and restores a service added in the panel, keeping its details", () => {
    const content = { ...added, "services/tax-audit": { shortDescription: "Kept" } };
    const hidden = hideService(content, "tax-audit");
    expect(hidden["services/tax-audit"]).toEqual({ shortDescription: "Kept" });
    expect(catalogEntry(restoreService(hidden, "tax-audit"), "tax-audit")?.status).toBe(
      "published",
    );
  });

  it("takes a hidden service off the home page, and restoring does not bring it back unasked", () => {
    const hidden = hideService({}, "gst-registration");
    expect(homeServiceSlugs(hidden)).not.toContain("gst-registration");
  });
});

describe("deleteDraft", () => {
  it("removes a draft and its saved text", () => {
    const content = deleteDraft({ ...added, "services/new-idea": { note: "x" } }, "new-idea");
    expect(catalogEntry(content, "new-idea")).toBeUndefined();
    expect(content["services/new-idea"]).toBeUndefined();
    expect(catalogEntry(content, "tax-audit")).toBeDefined();
  });

  it.each(["tax-audit", "gst-registration"])(
    "refuses to delete %s, which was published",
    (slug) => {
      expect(() => deleteDraft(added, slug)).toThrow();
    },
  );
});

describe("home page services", () => {
  it("starts with the code's choice", () => {
    expect(homeServiceSlugs({})).toEqual(home.serviceSlugs);
  });

  it("adds and removes one at a time", () => {
    const off = toggleHomeService({}, "gst-registration");
    expect(homeServiceSlugs(off)).not.toContain("gst-registration");
    const on = toggleHomeService(off, "gst-registration");
    expect(homeServiceSlugs(on)).toContain("gst-registration");
  });

  it("can't go past the limit", () => {
    const extra = services
      .map((service) => service.slug)
      .filter((s) => !home.serviceSlugs.includes(s));
    let content = {};
    for (const slug of extra) content = toggleHomeService(content, slug);
    expect(homeServiceSlugs(content)).toHaveLength(MAX_HOME_SERVICES);
  });

  it("ignores saved choices that are not public", () => {
    const content = {
      ...added,
      serviceCatalog: { ...added.serviceCatalog, homeSlugs: ["new-idea", "tax-audit", "gone"] },
    };
    expect(homeServiceSlugs(content)).toEqual(["tax-audit"]);
  });
});

describe("list helpers", () => {
  it("groups services under the three categories", () => {
    const groups = groupByCategory(publicServices(added));
    expect(groups.map((group) => group.id)).toEqual([
      "registration",
      "compliance-taxation",
      "business-licenses",
    ]);
    expect(groups[1].services.map((service) => service.slug)).toContain("tax-audit");
  });

  it("offers others from the same category first, never the service itself", () => {
    const list = publicServices(added);
    const others = otherServicesFrom(list, "tax-audit");
    expect(others).toHaveLength(3);
    expect(others.every((service) => service.category === "compliance-taxation")).toBe(true);
    expect(others.map((service) => service.slug)).not.toContain("tax-audit");
  });
});
