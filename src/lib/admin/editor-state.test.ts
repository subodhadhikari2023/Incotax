// @vitest-environment node
import { describe, expect, it } from "vitest";

import type { SectionSchema } from "@/lib/content-section";

import { addRow, fieldLabel, removeRow, sectionFormData, setField } from "./editor-state";

const schema: SectionSchema = [
  {
    title: "Top",
    items: [
      { kind: "text", name: "headline", label: "Headline", max: 50 },
      {
        kind: "list",
        name: "reviews",
        row: "review",
        max: 2,
        fields: [
          { name: "text", label: "text", max: 100, multiline: true },
          { name: "name", label: "name", max: 20 },
        ],
      },
    ],
  },
];
const values = {
  headline: "Hello",
  reviews: [{ text: "Good", name: "Asha" }],
};

describe("sectionFormData", () => {
  it("turns values into the fields the save actions read", () => {
    const data = sectionFormData(values);
    expect(data.get("headline")).toBe("Hello");
    expect(data.get("reviews.0.text")).toBe("Good");
    expect(data.get("reviews.0.name")).toBe("Asha");
  });
});

describe("setField", () => {
  it("changes a text field without touching the original", () => {
    const next = setField(values, "headline", "New");
    expect(next.headline).toBe("New");
    expect(values.headline).toBe("Hello");
  });

  it("changes one cell of a list row", () => {
    const next = setField(values, "reviews.0.name", "Ravi");
    expect(next.reviews).toEqual([{ text: "Good", name: "Ravi" }]);
    expect(values.reviews[0].name).toBe("Asha");
  });
});

describe("addRow and removeRow", () => {
  it("adds a blank row with every field of the list", () => {
    expect(addRow(schema, values, "reviews").reviews).toEqual([
      { text: "Good", name: "Asha" },
      { text: "", name: "" },
    ]);
  });

  it("removes the chosen row", () => {
    expect(removeRow(values, "reviews", 0).reviews).toEqual([]);
  });
});

describe("fieldLabel", () => {
  it("finds the label and limit of a text field", () => {
    expect(fieldLabel(schema, "headline")).toEqual({
      label: "Headline",
      max: 50,
      multiline: undefined,
    });
  });

  it("finds them for a list cell, with the row's number", () => {
    expect(fieldLabel(schema, "reviews.1.text")).toEqual({
      label: "Review 2 text",
      max: 100,
      multiline: true,
    });
  });
});
