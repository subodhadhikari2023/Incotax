// @vitest-environment node
import { describe, expect, it } from "vitest";

import { businessSchema } from "@/lib/business-schema";
import { homeSchema } from "@/lib/home-schema";
import { legalSchema } from "@/lib/legal-content";
import { contactSchema, whyIncotaxSchema } from "@/lib/pages-content";
import { serviceCopySchema } from "@/lib/service-copy";
import { siteCopySchema } from "@/lib/site-copy-schema";

describe.each([
  ["business", businessSchema],
  ["home", homeSchema],
  ["why-incotax", whyIncotaxSchema],
  ["contact", contactSchema],
  ["service", serviceCopySchema],
  ["legal", legalSchema],
  ["site", siteCopySchema],
])("the %s form", (_name, schema) => {
  // The editor must never have to guess what a group of fields changes.
  it("says where each group of fields appears on the site", () => {
    for (const group of schema) {
      expect(group.where, group.title).toEqual(expect.any(String));
      expect(group.where.length, group.title).toBeGreaterThan(10);
    }
  });

  it("only links to pages of this site", () => {
    for (const group of schema) {
      if (group.href) expect(group.href, group.title).toMatch(/^\/(?!\/)/);
    }
  });
});

describe("the business details form", () => {
  it("keeps its fields, with the phone keyboard and email keyboard on phones", () => {
    const fields = businessSchema.flatMap((group) => group.items);
    expect(fields.map((field) => field.name)).toEqual([
      "phone",
      "whatsappNumber",
      "email",
      "address",
      "hours",
    ]);
    expect(fields.map((field) => field.kind === "text" && field.inputType)).toEqual([
      "tel",
      "tel",
      "email",
      undefined,
      undefined,
    ]);
  });
});
