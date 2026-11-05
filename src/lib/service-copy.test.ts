// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getServiceDetail } from "@/content/service-details";
import { services } from "@/content/services";
import { pageCopy } from "@/content/site";

import { validateSection } from "./content-section";
import {
  checkServiceDetails,
  serviceCardDescriptions,
  serviceCopyFor,
  serviceCopyFormValues,
  serviceCopyKey,
  serviceCopySchema,
  serviceDetailFor,
} from "./service-copy";

const slug = "gst-registration";
const withOverview = services.find((service) => getServiceDetail(service.slug).overview)!;
const withoutOverview = services.find((service) => !getServiceDetail(service.slug).overview);

describe("serviceCopyKey", () => {
  it("keeps each service under its own key in the store", () => {
    expect(serviceCopyKey(slug)).toBe("services/gst-registration");
  });
});

describe("serviceCopyFor", () => {
  it("shows the defaults when nothing is saved", () => {
    expect(serviceCopyFor({}, slug)).toMatchObject({
      shortDescription: pageCopy.serviceShortDescription,
      overviewTwo: pageCopy.serviceOverviewTwo,
      cardDescription: pageCopy.serviceCardDescription,
      whatsappMessage: null,
    });
  });

  it("uses the PDF overview by default, else the placeholder", () => {
    expect(serviceCopyFor({}, withOverview.slug).overviewOne).toBe(
      getServiceDetail(withOverview.slug).overview,
    );
    if (withoutOverview) {
      expect(serviceCopyFor({}, withoutOverview.slug).overviewOne).toBe(
        pageCopy.serviceOverviewOne,
      );
    }
  });

  it("uses what is saved for that service only", () => {
    const content = {
      [serviceCopyKey(slug)]: {
        shortDescription: "Short",
        overviewOne: "One",
        overviewTwo: "Two",
        cardDescription: "Card",
        whatsappMessage: "Hello about GST",
      },
    };
    expect(serviceCopyFor(content, slug)).toEqual({
      shortDescription: "Short",
      overviewOne: "One",
      overviewTwo: "Two",
      cardDescription: "Card",
      whatsappMessage: "Hello about GST",
    });
    expect(serviceCopyFor(content, "llp-registration").shortDescription).toBe(
      pageCopy.serviceShortDescription,
    );
  });
});

describe("serviceCardDescriptions", () => {
  it("gives every service its description for the cards", () => {
    const descriptions = serviceCardDescriptions({
      [serviceCopyKey(slug)]: { cardDescription: "Card" },
    });
    expect(descriptions[slug]).toBe("Card");
    expect(descriptions["llp-registration"]).toBe(pageCopy.serviceCardDescription);
    expect(Object.keys(descriptions)).toHaveLength(services.length);
  });
});

describe("serviceCopyFormValues", () => {
  it("offers the real PDF overview, but no placeholders", () => {
    const values = serviceCopyFormValues({}, withOverview.slug);
    expect(values.overviewOne).toBe(getServiceDetail(withOverview.slug).overview);
    expect(values.shortDescription).toBe("");
    expect(values.cardDescription).toBe("");
    expect(values.whatsappMessage).toBe("");
  });
});

const plansSlug = "private-limited-company-incorporation";

function edited(fields: Record<string, unknown>, target = slug) {
  return { [serviceCopyKey(target)]: { detailsEdited: "1", ...fields } };
}

describe("serviceDetailFor", () => {
  it.each(services.map((service) => service.slug))(
    "shows the code's details for %s by default",
    (each) => {
      expect(serviceDetailFor({}, each)).toEqual(getServiceDetail(each));
    },
  );

  it("keeps the code's details for a section saved before details could be edited", () => {
    expect(
      serviceDetailFor({ [serviceCopyKey(slug)]: { shortDescription: "Short" } }, slug),
    ).toEqual(getServiceDetail(slug));
  });

  it("uses saved prices and rows", () => {
    const detail = serviceDetailFor(
      edited({
        pricingKind: "from",
        amount: "2,500",
        suffix: "plus GST",
        priceRows: [{ label: "Sole proprietor", value: "₹2,500" }],
      }),
      slug,
    );
    expect(detail.pricing).toEqual({
      kind: "from",
      amount: 2500,
      suffix: "plus GST",
      rows: [{ label: "Sole proprietor", value: "₹2,500" }],
    });
    expect(detail.plans).toBeUndefined();
  });

  it("uses a fixed fee and a quote", () => {
    expect(serviceDetailFor(edited({ pricingKind: "fixed", amount: "999" }), slug).pricing).toEqual(
      {
        kind: "fixed",
        amount: 999,
        suffix: undefined,
        rows: [],
      },
    );
    expect(
      serviceDetailFor(edited({ pricingKind: "quote", quoteText: "Ask us" }), slug).pricing,
    ).toEqual({ kind: "quote", text: "Ask us" });
  });

  it("builds plan prices, starting from the lowest", () => {
    const detail = serviceDetailFor(
      edited({
        pricingKind: "plans",
        priceBasic: "2000",
        priceStandard: "1,500",
        pricePremium: "9000",
      }),
      slug,
    );
    expect(detail.plans?.map((plan) => [plan.id, plan.price])).toEqual([
      ["basic", 2000],
      ["standard", 1500],
      ["premium", 9000],
    ]);
    expect(detail.pricing).toEqual({
      kind: "from",
      amount: 1500,
      rows: [
        { label: "Basic", value: "₹2,000" },
        { label: "Standard", value: "₹1,500" },
        { label: "Premium", value: "₹9,000" },
      ],
    });
  });

  it("uses saved included items, with the plans each belongs to", () => {
    const detail = serviceDetailFor(
      edited({
        pricingKind: "plans",
        included: [
          { name: "Filing", description: "We file it", plans: "standard,premium" },
          { name: "Advice", description: "", plans: "" },
        ],
      }),
      slug,
    );
    expect(detail.included).toEqual([
      { name: "Filing", description: "We file it", plans: ["standard", "premium"] },
      { name: "Advice", description: "" },
    ]);
  });

  // Once edited, a cleared line stays cleared: it must not bring the code's wording back.
  it("leaves out optional lines cleared by the editor", () => {
    const detail = serviceDetailFor(edited({ pricingKind: "quote" }, plansSlug), plansSlug);
    expect(detail.note).toBeUndefined();
    expect(detail.timeline).toBeUndefined();
    expect(detail.notIncluded).toBeUndefined();
    expect(detail.included).toEqual([]);
  });

  it("shows a saved note, timeline and not-included line", () => {
    const detail = serviceDetailFor(
      edited({ pricingKind: "quote", note: "A note", timeline: "5 days", notIncluded: "Taxes" }),
      slug,
    );
    expect(detail).toMatchObject({ note: "A note", timeline: "5 days", notIncluded: "Taxes" });
  });

  it("does not mix up services", () => {
    const content = edited({ pricingKind: "fixed", amount: "999" });
    expect(serviceDetailFor(content, "llp-registration")).toEqual(
      getServiceDetail("llp-registration"),
    );
  });
});

describe("the service form's starting values", () => {
  it("starts plan services with their plan prices", () => {
    expect(serviceCopyFormValues({}, plansSlug)).toMatchObject({
      pricingKind: "plans",
      priceBasic: "1499",
      priceStandard: "3499",
      pricePremium: "7499",
      detailsEdited: "1",
    });
  });

  it("gives each included item its plans", () => {
    const included = serviceCopyFormValues({}, plansSlug).included as { plans: string }[];
    expect(included[0].plans).toBe("basic,standard,premium");
    expect(included.some((item) => item.plans === "standard,premium")).toBe(true);
  });

  // Saving a service nobody has changed must never be refused, or change what visitors see.
  it.each(services.map((service) => service.slug))(
    "%s passes its own rules and survives a save",
    (each) => {
      const values = serviceCopyFormValues({}, each);
      const { values: checked, errors } = validateSection(serviceCopySchema, values);
      expect(errors).toEqual({});
      expect(checkServiceDetails(checked)).toEqual({});

      const stored = { [serviceCopyKey(each)]: checked };
      expect(serviceDetailFor(stored, each)).toEqual({
        ...getServiceDetail(each),
        overview: undefined,
      });
    },
  );
});

describe("checkServiceDetails", () => {
  const base = {
    pricingKind: "from",
    amount: "1000",
    priceBasic: "",
    priceStandard: "",
    pricePremium: "",
    included: [],
  };

  it("accepts a whole number, with or without commas", () => {
    expect(checkServiceDetails({ ...base, amount: "1,25,000" })).toEqual({});
  });

  it.each(["", "abc", "12.50", "-5", "₹1000"])("refuses %j as a price", (amount) => {
    expect(checkServiceDetails({ ...base, amount }).amount).toEqual(expect.any(String));
  });

  it("does not need an amount for a quote", () => {
    expect(checkServiceDetails({ ...base, pricingKind: "quote", amount: "" })).toEqual({});
  });

  it("needs all three prices for plans", () => {
    expect(
      checkServiceDetails({ ...base, pricingKind: "plans", amount: "", priceBasic: "100" }),
    ).toEqual({ priceStandard: expect.any(String), pricePremium: expect.any(String) });
  });

  it("refuses a way of showing the fee that does not exist", () => {
    expect(checkServiceDetails({ ...base, pricingKind: "free" }).pricingKind).toEqual(
      expect.any(String),
    );
  });

  it("refuses plans that do not exist on an item", () => {
    expect(
      checkServiceDetails({
        ...base,
        included: [{ name: "Filing", description: "", plans: "basic,gold" }],
      }),
    ).toEqual({ "included.0.plans": expect.any(String) });
  });
});
