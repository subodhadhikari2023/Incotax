// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { home } from "@/content/home";

import { readStoredContent } from "./content-store";
import {
  getHomeContent,
  homeFormValues,
  homeListLimits,
  mergeHomeContent,
  parseHomeForm,
  validateHomeContent,
  type HomeFormValues,
} from "./home-content";

vi.mock("./content-store", () => ({ readStoredContent: vi.fn() }));

const blank: HomeFormValues = {
  heroLabel: "",
  headline: "",
  goldPhrase: "",
  heroText: "",
  servicesIntro: "",
  howHeading: "",
  howIntro: "",
  feesIntro: "",
  featuredTag: "",
  reviewsIntro: "",
  stats: [],
  clients: [],
  steps: [],
  highlights: [],
  reviews: [],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("mergeHomeContent", () => {
  it("shows the src/content defaults when nothing is saved", () => {
    expect(mergeHomeContent({})).toEqual(home);
  });

  it.each([{ home: "text" }, { home: null }, { home: [] }])(
    "ignores a saved section with the wrong shape: %j",
    (content) => {
      expect(mergeHomeContent(content)).toEqual(home);
    },
  );

  it("prefers saved text, field by field, and leaves the rest alone", () => {
    const merged = mergeHomeContent({
      home: { heroLabel: "Trusted advisers", feesIntro: "Clear fees", reviewsIntro: "" },
    });
    expect(merged.hero.label).toBe("Trusted advisers");
    expect(merged.hero.headline).toBe(home.hero.headline);
    expect(merged.fees.intro).toBe("Clear fees");
    expect(merged.reviewsIntro).toBe(home.reviewsIntro);
  });

  it("maps every saved text field to its place on the page", () => {
    const merged = mergeHomeContent({
      home: {
        headline: "Build It Right",
        goldPhrase: "It Right",
        heroText: "Support text",
        servicesIntro: "Services line",
        howHeading: "How we work",
        howIntro: "Process line",
        featuredTag: "Most chosen",
      },
    });
    expect(merged.hero).toMatchObject({
      headline: "Build It Right",
      goldPhrase: "It Right",
      text: "Support text",
    });
    expect(merged.servicesIntro).toBe("Services line");
    expect(merged.howItWorks).toEqual({ heading: "How we work", intro: "Process line" });
    expect(merged.fees.featuredTag).toBe("Most chosen");
  });

  it("keeps what the panel does not edit: service picks, the fee plans and the featured plan", () => {
    const merged = mergeHomeContent({ home: { feesIntro: "Clear fees" } });
    expect(merged.serviceSlugs).toEqual(home.serviceSlugs);
    expect(merged.fees.serviceSlug).toBe(home.fees.serviceSlug);
    expect(merged.fees.serviceLabel).toBe(home.fees.serviceLabel);
    expect(merged.fees.featuredPlan).toBe(home.fees.featuredPlan);
  });

  it("uses saved lists in place of the defaults", () => {
    const merged = mergeHomeContent({
      home: {
        stats: [{ value: "5+", label: "Years" }],
        clients: [{ name: "Acme Traders" }],
        steps: [{ title: "Message us", text: "On WhatsApp" }],
        highlights: [{ text: "Name approval" }],
        reviews: [{ text: "Very helpful", name: "A. Client", detail: "Patna" }],
      },
    });
    expect(merged.stats).toEqual([{ value: "5+", label: "Years" }]);
    expect(merged.clients).toEqual(["Acme Traders"]);
    expect(merged.steps).toEqual([{ title: "Message us", text: "On WhatsApp" }]);
    expect(merged.fees.highlights).toEqual(["Name approval"]);
    expect(merged.reviews).toEqual([{ text: "Very helpful", name: "A. Client", detail: "Patna" }]);
  });

  // An empty saved list means "show none"; it must not bring the placeholders back.
  it("keeps a saved empty list empty, so its section can be hidden", () => {
    const merged = mergeHomeContent({ home: { clients: [], steps: [], reviews: [] } });
    expect(merged.clients).toEqual([]);
    expect(merged.steps).toEqual([]);
    expect(merged.reviews).toEqual([]);
    expect(merged.stats).toEqual(home.stats);
  });

  it("uses the defaults for a list with the wrong shape and drops malformed rows", () => {
    const merged = mergeHomeContent({
      home: {
        stats: "not a list",
        clients: [{ name: "Acme Traders" }, { name: 5 }, null, "text", { name: "" }],
        reviews: [{ text: "Good", name: "A. Client" }, { text: "No name" }],
      },
    });
    expect(merged.stats).toEqual(home.stats);
    expect(merged.clients).toEqual(["Acme Traders"]);
    expect(merged.reviews).toEqual([{ text: "Good", name: "A. Client", detail: "" }]);
  });
});

describe("getHomeContent", () => {
  it("merges what the store holds over the defaults", async () => {
    vi.mocked(readStoredContent).mockResolvedValue({ home: { headline: "Saved headline" } });
    const content = await getHomeContent();
    expect(content.hero.headline).toBe("Saved headline");
    expect(content.hero.text).toBe(home.hero.text);
  });
});

describe("homeFormValues", () => {
  it("starts from the real defaults, leaving out every placeholder", () => {
    const values = homeFormValues({});
    expect(values.headline).toBe(home.hero.headline);
    expect(values.heroText).toBe(home.hero.text);
    expect(values.stats).toEqual(home.stats);
    expect(values.heroLabel).toBe("");
    expect(values.goldPhrase).toBe("");
    expect(values.featuredTag).toBe("");
    expect(values.clients).toEqual([]);
    expect(values.steps).toEqual([]);
    expect(values.highlights).toEqual([]);
    expect(values.reviews).toEqual([]);
  });

  it("shows what is saved, including a list saved as empty", () => {
    const values = homeFormValues({
      home: { heroLabel: "Trusted advisers", stats: [], clients: [{ name: "Acme Traders" }] },
    });
    expect(values.heroLabel).toBe("Trusted advisers");
    expect(values.stats).toEqual([]);
    expect(values.clients).toEqual([{ name: "Acme Traders" }]);
  });
});

describe("parseHomeForm", () => {
  it("reads the text fields, treating a missing one as blank", () => {
    const data = new FormData();
    data.set("headline", "Build It Right");
    const values = parseHomeForm(data);
    expect(values.headline).toBe("Build It Right");
    expect(values.heroLabel).toBe("");
  });

  it("reads list rows in order from their numbered field names", () => {
    const data = new FormData();
    data.set("stats.0.value", "5+");
    data.set("stats.0.label", "Years");
    data.set("stats.1.value", "9");
    data.set("stats.1.label", "Cases");
    data.set("clients.0.name", "Acme Traders");
    const values = parseHomeForm(data);
    expect(values.stats).toEqual([
      { value: "5+", label: "Years" },
      { value: "9", label: "Cases" },
    ]);
    expect(values.clients).toEqual([{ name: "Acme Traders" }]);
    expect(values.reviews).toEqual([]);
  });

  it("does not stop at a gap, so a forged form can't hide rows from validation", () => {
    const data = new FormData();
    data.set("clients.0.name", "First");
    data.set("clients.2.name", "Third");
    expect(parseHomeForm(data).clients).toEqual([{ name: "First" }, { name: "Third" }]);
  });
});

describe("validateHomeContent", () => {
  it("allows everything to be blank, and every list to be empty", () => {
    expect(validateHomeContent(blank)).toEqual({ values: blank, errors: {} });
  });

  it("trims text and list fields", () => {
    const { values, errors } = validateHomeContent({
      ...blank,
      headline: "  Build It Right ",
      clients: [{ name: " Acme Traders " }],
    });
    expect(errors).toEqual({});
    expect(values.headline).toBe("Build It Right");
    expect(values.clients).toEqual([{ name: "Acme Traders" }]);
  });

  it("drops rows left completely blank", () => {
    const { values, errors } = validateHomeContent({
      ...blank,
      stats: [
        { value: " ", label: "" },
        { value: "5+", label: "Years" },
      ],
    });
    expect(errors).toEqual({});
    expect(values.stats).toEqual([{ value: "5+", label: "Years" }]);
  });

  it("names the missing field in a half-filled row, counted after blank rows are dropped", () => {
    const { errors } = validateHomeContent({
      ...blank,
      steps: [
        { title: "", text: "" },
        { title: "Message us", text: "" },
      ],
    });
    expect(errors).toEqual({ "steps.0.text": expect.any(String) });
  });

  it("requires a review's text and name, but not its city or service", () => {
    expect(
      validateHomeContent({
        ...blank,
        reviews: [{ text: "Very helpful", name: "A. Client", detail: "" }],
      }).errors,
    ).toEqual({});
    expect(
      validateHomeContent({
        ...blank,
        reviews: [{ text: "", name: "", detail: "Patna" }],
      }).errors,
    ).toEqual({ "reviews.0.text": expect.any(String), "reviews.0.name": expect.any(String) });
  });

  it("checks the gold words appear in the headline being saved", () => {
    expect(
      validateHomeContent({ ...blank, headline: "Build It Right", goldPhrase: "It Right" }).errors,
    ).toEqual({});
    expect(
      validateHomeContent({ ...blank, headline: "Build It Right", goldPhrase: "Elsewhere" }).errors
        .goldPhrase,
    ).toMatch(/headline/i);
  });

  it("checks the gold words against the default headline when the headline is blank", () => {
    expect(validateHomeContent({ ...blank, goldPhrase: "Vision" }).errors).toEqual({});
    expect(validateHomeContent({ ...blank, goldPhrase: "Elsewhere" }).errors.goldPhrase).toEqual(
      expect.any(String),
    );
  });

  it("limits the length of text and list fields", () => {
    const { errors } = validateHomeContent({
      ...blank,
      heroLabel: "a".repeat(61),
      headline: "a".repeat(121),
      heroText: "a".repeat(401),
      feesIntro: "a".repeat(201),
      featuredTag: "a".repeat(31),
      stats: [{ value: "a".repeat(11), label: "a".repeat(41) }],
      clients: [{ name: "a".repeat(61) }],
      steps: [{ title: "a".repeat(61), text: "a".repeat(161) }],
      highlights: [{ text: "a".repeat(81) }],
      reviews: [{ text: "a".repeat(601), name: "a".repeat(61), detail: "a".repeat(61) }],
    });
    expect(Object.keys(errors).sort()).toEqual(
      [
        "heroLabel",
        "headline",
        "heroText",
        "feesIntro",
        "featuredTag",
        "stats.0.value",
        "stats.0.label",
        "clients.0.name",
        "steps.0.title",
        "steps.0.text",
        "highlights.0.text",
        "reviews.0.text",
        "reviews.0.name",
        "reviews.0.detail",
      ].sort(),
    );
  });

  it("accepts text exactly at the length limits", () => {
    expect(
      validateHomeContent({
        ...blank,
        heroLabel: "a".repeat(60),
        headline: "a".repeat(120),
        heroText: "a".repeat(400),
        feesIntro: "a".repeat(200),
        featuredTag: "a".repeat(30),
        clients: [{ name: "a".repeat(60) }],
      }).errors,
    ).toEqual({});
  });

  it("refuses more rows than a list can hold, which a forged form could send", () => {
    const { errors } = validateHomeContent({
      ...blank,
      clients: Array.from({ length: homeListLimits.clients + 1 }, (_, i) => ({ name: `C${i}` })),
    });
    expect(errors.clients).toEqual(expect.any(String));
  });

  it("holds lists to what the designed layouts fit", () => {
    expect(homeListLimits).toEqual({ stats: 4, clients: 12, steps: 4, highlights: 6, reviews: 6 });
  });
});
