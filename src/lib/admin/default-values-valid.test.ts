// @vitest-environment node
import { describe, expect, it } from "vitest";

import { services } from "@/content/services";
import { businessFormValues, validateBusinessDetails } from "@/lib/business";
import { validateSection } from "@/lib/content-section";
import { homeFormValues, validateHomeContent } from "@/lib/home-content";
import {
  contactFormValues,
  contactSchema,
  whyIncotaxFormValues,
  whyIncotaxSchema,
} from "@/lib/pages-content";
import { serviceCopyFormValues, serviceCopySchema } from "@/lib/service-copy";
import { siteCopyFormValues } from "@/lib/site-copy";
import { siteCopySchema } from "@/lib/site-copy-schema";

// Each editor opens on the site's real text. Saving it untouched must pass, or the client could
// not save that page at all.
describe("every editor's starting values pass its own checks", () => {
  it("business details", () => {
    expect(validateBusinessDetails(businessFormValues({})).errors).toEqual({});
  });

  it("home page", () => {
    expect(validateHomeContent(homeFormValues({})).errors).toEqual({});
  });

  it("site-wide text", () => {
    expect(validateSection(siteCopySchema, siteCopyFormValues({})).errors).toEqual({});
  });

  it("Why IncoTax", () => {
    expect(validateSection(whyIncotaxSchema, whyIncotaxFormValues({})).errors).toEqual({});
  });

  it("Contact", () => {
    expect(validateSection(contactSchema, contactFormValues({})).errors).toEqual({});
  });

  it.each(services.map((service) => service.slug))("service page %s", (slug) => {
    expect(validateSection(serviceCopySchema, serviceCopyFormValues({}, slug)).errors).toEqual({});
  });
});
