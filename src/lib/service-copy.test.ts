// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getServiceDetail } from "@/content/service-details";
import { services } from "@/content/services";
import { pageCopy } from "@/content/site";

import {
  serviceCardDescriptions,
  serviceCopyFor,
  serviceCopyFormValues,
  serviceCopyKey,
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
