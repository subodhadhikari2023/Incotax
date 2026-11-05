// @vitest-environment node
import { describe, expect, it } from "vitest";

import { contact, whyIncotax } from "@/content/pages";

import {
  contactFormValues,
  founderPhotoUrls,
  mergeContactContent,
  mergeWhyIncotaxContent,
  whyIncotaxFormValues,
} from "./pages-content";

describe("mergeWhyIncotaxContent", () => {
  it("shows the src/content defaults when nothing is saved", () => {
    expect(mergeWhyIncotaxContent({})).toEqual(whyIncotax);
  });

  it("uses saved text and lists", () => {
    const merged = mergeWhyIncotaxContent({
      whyIncotax: {
        title: "Why choose us",
        intro: "Intro line",
        practiceIntro: "Practice line",
        courtLine: "Court line",
        areaLine: "Area line",
        aboutParagraphs: [{ text: "First" }, { text: "Second" }],
        courts: [{ name: "Supreme Court" }],
        areas: [],
      },
    });
    expect(merged).toMatchObject({
      title: "Why choose us",
      intro: "Intro line",
      practiceIntro: "Practice line",
      courtLine: "Court line",
      areaLine: "Area line",
      aboutParagraphs: ["First", "Second"],
      courts: ["Supreme Court"],
      areas: [],
    });
  });

  it("edits each founder's bio and points, keeping names, roles and titles from the code", () => {
    const merged = mergeWhyIncotaxContent({
      whyIncotax: { founderBio0: "New bio", founderPoints1: [{ text: "New point" }] },
    });
    expect(merged.founders[0]).toEqual({ ...whyIncotax.founders[0], bio: "New bio" });
    expect(merged.founders[1]).toEqual({ ...whyIncotax.founders[1], points: ["New point"] });
  });
});

describe("whyIncotaxFormValues", () => {
  it("offers the real bios, courts and areas, but no placeholders", () => {
    const values = whyIncotaxFormValues({});
    expect(values.founderBio0).toBe(whyIncotax.founders[0].bio);
    expect(values.courts).toEqual(whyIncotax.courts.map((name) => ({ name })));
    expect(values.areas).toEqual(whyIncotax.areas.map((name) => ({ name })));
    expect(values.title).toBe("");
    expect(values.aboutParagraphs).toEqual([]);
    expect(values.founderPoints0).toEqual([]);
  });
});

describe("contact content", () => {
  it("shows the src/content defaults when nothing is saved", () => {
    expect(mergeContactContent({})).toEqual(contact);
  });

  it("uses saved text and leaves the map slot alone", () => {
    const merged = mergeContactContent({
      contact: { title: "Reach us", formHeading: "Write in", whatsappLine: "Tap here" },
    });
    expect(merged).toMatchObject({
      title: "Reach us",
      formHeading: "Write in",
      whatsappLine: "Tap here",
      intro: contact.intro,
      map: contact.map,
    });
  });

  it("offers no placeholders in the form", () => {
    expect(contactFormValues({ contact: { title: "Reach us" } })).toMatchObject({
      title: "Reach us",
      intro: "",
    });
  });
});

describe("founderPhotoUrls", () => {
  it("has no photos until some are saved", () => {
    expect(founderPhotoUrls({})).toEqual([null, null]);
  });

  it("gives each saved photo an address that changes with its version", () => {
    expect(founderPhotoUrls({ founderPhotos: { "1": "abc" } })).toEqual([
      null,
      "/media/founder-1?v=abc",
    ]);
  });

  it.each([{ founderPhotos: "text" }, { founderPhotos: { "0": 5 } }, { founderPhotos: null }])(
    "ignores stored data of the wrong shape: %j",
    (content) => {
      expect(founderPhotoUrls(content)).toEqual([null, null]);
    },
  );
});
