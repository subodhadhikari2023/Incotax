// @vitest-environment node
import { describe, expect, it } from "vitest";

import { legal } from "@/content/pages";

import { validateSection } from "./content-section";
import { legalContentFor, legalContentKey, legalFormValues, legalSchema } from "./legal-content";

const slug = "privacy-policy";

describe("legalContentKey", () => {
  it("keeps each legal page under its own key in the store", () => {
    expect(legalContentKey(slug)).toBe("legal/privacy-policy");
  });
});

describe("legalContentFor", () => {
  it("shows the placeholder layout when nothing is saved", () => {
    expect(legalContentFor({}, slug)).toEqual(legal);
  });

  it("splits saved text into paragraphs on blank lines, and a list into its lines", () => {
    const merged = legalContentFor(
      {
        [legalContentKey(slug)]: {
          lastUpdated: "1 November 2026",
          questionsLine: "Write to us",
          sections: [
            {
              heading: "Data we collect",
              body: "First paragraph.\nStill the first.\n\n  \n\nSecond paragraph.",
              list: "Name\n\n Mobile number \n",
            },
            { heading: "Your rights", body: "Only text.", list: "" },
          ],
        },
      },
      slug,
    );
    expect(merged).toEqual({
      lastUpdated: "1 November 2026",
      questionsLine: "Write to us",
      sections: [
        {
          heading: "Data we collect",
          paragraphs: ["First paragraph.\nStill the first.", "Second paragraph."],
          list: ["Name", "Mobile number"],
        },
        { heading: "Your rights", paragraphs: ["Only text."] },
      ],
    });
  });

  // A legal page with no text at all would look finished, so it keeps its marked placeholders.
  it("keeps the placeholder layout when the saved list of sections is empty", () => {
    const merged = legalContentFor({ [legalContentKey(slug)]: { sections: [] } }, slug);
    expect(merged.sections).toEqual(legal.sections);
  });

  it("does not mix up the pages", () => {
    const content = { [legalContentKey(slug)]: { lastUpdated: "1 November 2026" } };
    expect(legalContentFor(content, "disclaimer").lastUpdated).toBe(legal.lastUpdated);
  });
});

describe("legalFormValues", () => {
  it("starts empty, with no placeholders", () => {
    expect(legalFormValues({}, slug)).toEqual({ lastUpdated: "", questionsLine: "", sections: [] });
  });
});

describe("the legal form's rules", () => {
  const blank = { lastUpdated: "", questionsLine: "", sections: [] };

  it("needs a heading, but a section can be text only or a list only", () => {
    expect(
      validateSection(legalSchema, {
        ...blank,
        sections: [{ heading: "Rights", body: "", list: "An item" }],
      }).errors,
    ).toEqual({});
    expect(
      validateSection(legalSchema, {
        ...blank,
        sections: [{ heading: "", body: "Some text", list: "" }],
      }).errors,
    ).toEqual({ "sections.0.heading": expect.any(String) });
  });

  it("allows long legal text", () => {
    expect(
      validateSection(legalSchema, {
        ...blank,
        sections: [{ heading: "Terms", body: "a".repeat(6000), list: "" }],
      }).errors,
    ).toEqual({});
  });
});
