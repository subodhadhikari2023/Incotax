import { describe, expect, it } from "vitest";

import { getServiceDetail, serviceDetails } from "./service-details";
import { otherServices, services } from "./services";

const PLAN_SERVICES = [
  "private-limited-company-incorporation",
  "llp-registration",
  "opc-registration",
];
const QUOTE_SERVICES = [
  "gst-return-filing",
  "shop-and-establishment-registration",
  "iso-certification",
  "rera-registration",
];

describe("service details", () => {
  it("has details with included items for every service", () => {
    for (const service of services) {
      expect(serviceDetails[service.slug], service.slug).toBeDefined();
      expect(serviceDetails[service.slug].included.length, service.slug).toBeGreaterThan(0);
    }
  });

  it("gives only Private Limited, LLP and OPC the Basic / Standard / Premium plans", () => {
    const withPlans = services.filter((s) => serviceDetails[s.slug].plans).map((s) => s.slug);
    expect(withPlans).toEqual(PLAN_SERVICES);

    for (const slug of PLAN_SERVICES) {
      const detail = getServiceDetail(slug);
      expect(detail.plans?.map((p) => [p.name, p.price])).toEqual([
        ["Basic", 1499],
        ["Standard", 3499],
        ["Premium", 7499],
      ]);
    }
  });

  it("starts plan services from the lowest plan price, with the plans as breakdown rows", () => {
    for (const slug of PLAN_SERVICES) {
      const { pricing } = getServiceDetail(slug);
      expect(pricing.kind).toBe("from");
      if (pricing.kind === "quote") return;
      expect(pricing.amount).toBe(1499);
      expect(pricing.rows.map((r) => r.label)).toEqual(["Basic", "Standard", "Premium"]);
    }
  });

  it("uses the lowest figure from the PDF as the starting price", () => {
    const amounts = Object.fromEntries(
      services.map((s) => {
        const { pricing } = getServiceDetail(s.slug);
        return [s.slug, pricing.kind === "quote" ? null : [pricing.kind, pricing.amount]];
      }),
    );

    expect(amounts["section-8-company-registration"]).toEqual(["from", 6499]);
    expect(amounts["sole-proprietorship-registration"]).toEqual(["from", 3499]);
    expect(amounts["private-limited-annual-compliance"]).toEqual(["from", 25000]);
    expect(amounts["llp-annual-compliance"]).toEqual(["from", 2000]);
    expect(amounts["change-of-company-name"]).toEqual(["from", 5000]);
    expect(amounts["gst-registration"]).toEqual(["from", 1000]);
    expect(amounts["iec-registration"]).toEqual(["from", 1000]);
    expect(amounts["startup-india-dpiit-recognition"]).toEqual(["fixed", 4000]);
    expect(amounts["trademark-registration"]).toEqual(["fixed", 2499]);
  });

  it("shows no price for the contact-us services", () => {
    const quotes = services.filter((s) => getServiceDetail(s.slug).pricing.kind === "quote");
    expect(quotes.map((s) => s.slug)).toEqual(QUOTE_SERVICES);
  });

  it("tags plan-only items with the plans that include them", () => {
    const items = getServiceDetail("private-limited-company-incorporation").included;
    const plansOf = (name: string) => items.find((i) => i.name === name)?.plans;

    expect(plansOf("Expert Assistance")).toEqual(["basic", "standard", "premium"]);
    expect(plansOf("Certificate of Incorporation")).toEqual(["standard", "premium"]);
    expect(plansOf("Startup India Registration")).toEqual(["premium"]);
  });

  it("lists each included item only once per service", () => {
    for (const service of services) {
      const names = getServiceDetail(service.slug).included.map((i) => i.name);
      expect(new Set(names).size, service.slug).toBe(names.length);
    }
  });
});

describe("otherServices", () => {
  it("returns three other services, same category first", () => {
    const others = otherServices("gst-registration");

    expect(others).toHaveLength(3);
    expect(others.map((s) => s.slug)).not.toContain("gst-registration");
    expect(new Set(others.map((s) => s.slug)).size).toBe(3);
    expect(others.every((s) => s.category === "compliance-taxation")).toBe(true);
  });
});
