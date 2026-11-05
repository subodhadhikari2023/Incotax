import type { ListRow, SectionSchema } from "./content-section";

export const homeListLimits = { stats: 4, clients: 12, steps: 4, highlights: 6, reviews: 6 };

const HIDES = "Leaving this list empty hides this section on the home page.";

export type HomeFormValues = {
  heroLabel: string;
  headline: string;
  goldPhrase: string;
  heroText: string;
  servicesIntro: string;
  howHeading: string;
  howIntro: string;
  feesIntro: string;
  featuredTag: string;
  reviewsIntro: string;
  stats: ListRow[];
  clients: ListRow[];
  steps: ListRow[];
  highlights: ListRow[];
  reviews: ListRow[];
};

export const homeSchema: SectionSchema = [
  {
    title: "Hero",
    where:
      "The first thing visitors see, at the top of the home page. The stats also show on Why IncoTax.",
    href: "/#hero",
    items: [
      { kind: "text", name: "heroLabel", label: "Label above the headline", max: 60 },
      { kind: "text", name: "headline", label: "Headline", max: 120 },
      {
        kind: "text",
        name: "goldPhrase",
        label: "Gold words in the headline",
        max: 120,
        hint: "Words copied exactly from the headline, shown in gold italics. Optional.",
      },
      { kind: "text", name: "heroText", label: "Supporting text", max: 400, multiline: true },
      {
        kind: "list",
        name: "stats",
        row: "stat",
        max: homeListLimits.stats,
        hint: "Also shown on Why IncoTax. Leaving this list empty hides this section on both pages.",
        fields: [
          { name: "value", label: "value", max: 10 },
          { name: "label", label: "label", max: 40 },
        ],
      },
    ],
  },
  {
    title: "Clients",
    where: "Just under the hero on the home page.",
    href: "/#clients-heading",
    items: [
      {
        kind: "list",
        name: "clients",
        row: "client",
        max: homeListLimits.clients,
        hint: HIDES,
        fields: [{ name: "name", label: "name", max: 60 }],
      },
    ],
  },
  {
    title: "Services",
    where: "The line above the service cards on the home page.",
    href: "/#services",
    items: [{ kind: "text", name: "servicesIntro", label: "Services intro", max: 200 }],
  },
  {
    title: "How it works",
    where: "The numbered steps, under the service cards on the home page.",
    href: "/#how-heading",
    items: [
      { kind: "text", name: "howHeading", label: "How it works heading", max: 120 },
      { kind: "text", name: "howIntro", label: "How it works intro", max: 200 },
      {
        kind: "list",
        name: "steps",
        row: "step",
        max: homeListLimits.steps,
        hint: HIDES,
        fields: [
          { name: "title", label: "title", max: 60 },
          { name: "text", label: "text", max: 160 },
        ],
      },
    ],
  },
  {
    title: "Fees",
    where: "The three price cards on the home page.",
    href: "/#fees-heading",
    items: [
      { kind: "text", name: "feesIntro", label: "Fees intro", max: 200 },
      { kind: "text", name: "featuredTag", label: "Featured plan tag", max: 30 },
      {
        kind: "list",
        name: "highlights",
        row: "fee highlight",
        max: homeListLimits.highlights,
        hint: "Shown on every fee card. Prices and plans come from the service data.",
        fields: [{ name: "text", label: "", max: 80 }],
      },
    ],
  },
  {
    title: "Reviews",
    where: "Near the bottom of the home page, above the gold WhatsApp band.",
    href: "/#reviews-heading",
    items: [
      { kind: "text", name: "reviewsIntro", label: "Reviews intro", max: 200 },
      {
        kind: "list",
        name: "reviews",
        row: "review",
        max: homeListLimits.reviews,
        hint: HIDES,
        fields: [
          { name: "text", label: "text", max: 600, multiline: true },
          { name: "name", label: "name", max: 60 },
          { name: "detail", label: "city or service", max: 60, optional: true },
        ],
      },
    ],
  },
];
