// @vitest-environment node
import { describe, expect, it } from "vitest";

import { forms, popup } from "@/content/pages";
import { pageCopy, site } from "@/content/site";

import { siteCopyFormValues, mergeSiteCopy } from "./site-copy";

describe("mergeSiteCopy", () => {
  it("shows the src/content defaults when nothing is saved", () => {
    expect(mergeSiteCopy({})).toEqual({
      whatsappMessage: site.whatsappMessage,
      band: { heading: pageCopy.whatsappBandHeading, line: pageCopy.whatsappBandLine },
      serviceCoversIntro: pageCopy.serviceCoversIntro,
      otherServicesIntro: pageCopy.otherServicesIntro,
      forms,
      popup,
    });
  });

  it("maps every saved field to its place", () => {
    const copy = mergeSiteCopy({
      site: {
        whatsappMessage: "Hello IncoTax",
        whatsappBandHeading: "Talk to us",
        whatsappBandLine: "Tap below",
        serviceCoversIntro: "Covers line",
        otherServicesIntro: "Others line",
        submitLabel: "Send",
        afterSubmit: "Thanks",
        formNote: "We reply fast",
        popupLabel: "Quick quote",
        popupHeading: "Tell us",
        popupLine: "Pop-up line",
        popupNote: "Pop-up note",
      },
    });
    expect(copy).toEqual({
      whatsappMessage: "Hello IncoTax",
      band: { heading: "Talk to us", line: "Tap below" },
      serviceCoversIntro: "Covers line",
      otherServicesIntro: "Others line",
      forms: { submitLabel: "Send", afterSubmit: "Thanks", note: "We reply fast" },
      popup: {
        label: "Quick quote",
        heading: "Tell us",
        line: "Pop-up line",
        note: "Pop-up note",
      },
    });
  });
});

describe("siteCopyFormValues", () => {
  it("starts from real defaults and leaves out placeholders", () => {
    const values = siteCopyFormValues({});
    expect(values.popupHeading).toBe(popup.heading);
    expect(values.submitLabel).toBe("");
    expect(values.whatsappMessage).toBe("");
  });
});
