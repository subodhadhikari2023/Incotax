import { contact, whyIncotax } from "@/content/pages";

import {
  savedSection,
  sectionFormValues,
  type ListRow,
  type SectionSchema,
} from "./content-section";
import type { StoredContent } from "./content-store";

const texts = (rows: ListRow[] | undefined) => rows?.map((row) => row.text);
const names = (rows: ListRow[] | undefined) => rows?.map((row) => row.name);

// Founder names, roles and titles stay in src/content: search engines read them from there too.
export const whyIncotaxSchema: SectionSchema = [
  {
    title: "Page top",
    items: [
      { kind: "text", name: "title", label: "Page headline", max: 120 },
      { kind: "text", name: "intro", label: "Page intro", max: 300, multiline: true },
    ],
  },
  {
    title: "About IncoTax",
    items: [
      {
        kind: "list",
        name: "aboutParagraphs",
        row: "about paragraph",
        max: 6,
        hint: "Leaving this list empty hides this section.",
        fields: [{ name: "text", label: "", max: 1500, multiline: true }],
      },
    ],
  },
  ...whyIncotax.founders.map((founder, i) => ({
    title: founder.name,
    items: [
      {
        kind: "text" as const,
        name: `founderBio${i}`,
        label: `${founder.name} bio`,
        max: 1500,
        multiline: true,
      },
      {
        kind: "list" as const,
        name: `founderPoints${i}`,
        row: `${founder.name} point`,
        max: 6,
        fields: [{ name: "text", label: "", max: 100 }],
      },
    ],
  })),
  {
    title: "Courts and areas of law",
    items: [
      { kind: "text", name: "practiceIntro", label: "Courts and areas intro", max: 200 },
      { kind: "text", name: "courtLine", label: "Line under each court", max: 200 },
      { kind: "text", name: "areaLine", label: "Line under each area of law", max: 200 },
      {
        kind: "list",
        name: "courts",
        row: "court",
        max: 12,
        hint: "Emptying both this list and the areas of law hides this section.",
        fields: [{ name: "name", label: "", max: 80 }],
      },
      {
        kind: "list",
        name: "areas",
        row: "area of law",
        max: 12,
        fields: [{ name: "name", label: "", max: 80 }],
      },
    ],
  },
];

export function mergeWhyIncotaxContent(content: StoredContent): typeof whyIncotax {
  const saved = savedSection(whyIncotaxSchema, content.whyIncotax) as Record<
    string,
    string & ListRow[]
  >;
  return {
    ...whyIncotax,
    title: saved.title ?? whyIncotax.title,
    intro: saved.intro ?? whyIncotax.intro,
    aboutParagraphs: texts(saved.aboutParagraphs) ?? whyIncotax.aboutParagraphs,
    founders: whyIncotax.founders.map((founder, i) => ({
      ...founder,
      bio: saved[`founderBio${i}`] ?? founder.bio,
      points: texts(saved[`founderPoints${i}`]) ?? founder.points,
    })),
    practiceIntro: saved.practiceIntro ?? whyIncotax.practiceIntro,
    courts: names(saved.courts) ?? whyIncotax.courts,
    areas: names(saved.areas) ?? whyIncotax.areas,
    courtLine: saved.courtLine ?? whyIncotax.courtLine,
    areaLine: saved.areaLine ?? whyIncotax.areaLine,
  };
}

/** Each founder's photo address, which changes with the photo. Null until one is uploaded. */
export function founderPhotoUrls(content: StoredContent): (string | null)[] {
  const stored = content.founderPhotos;
  const photos = typeof stored === "object" && stored !== null ? stored : {};
  return whyIncotax.founders.map((_, i) => {
    const version = (photos as Record<string, unknown>)[i];
    return typeof version === "string" && version ? `/media/founder-${i}?v=${version}` : null;
  });
}

export function whyIncotaxFormValues(content: StoredContent) {
  return sectionFormValues(whyIncotaxSchema, content.whyIncotax, {
    title: whyIncotax.title,
    intro: whyIncotax.intro,
    aboutParagraphs: whyIncotax.aboutParagraphs.map((text) => ({ text })),
    ...Object.fromEntries(
      whyIncotax.founders.flatMap((founder, i) => [
        [`founderBio${i}`, founder.bio],
        [`founderPoints${i}`, founder.points.map((text) => ({ text }))],
      ]),
    ),
    practiceIntro: whyIncotax.practiceIntro,
    courtLine: whyIncotax.courtLine,
    areaLine: whyIncotax.areaLine,
    courts: whyIncotax.courts.map((name) => ({ name })),
    areas: whyIncotax.areas.map((name) => ({ name })),
  });
}

// The map slot stays in src/content until the office address is chosen.
export const contactSchema: SectionSchema = [
  {
    title: "Page top",
    items: [
      { kind: "text", name: "title", label: "Page headline", max: 120 },
      { kind: "text", name: "intro", label: "Page intro", max: 300, multiline: true },
    ],
  },
  {
    title: "Contact form",
    items: [
      { kind: "text", name: "formHeading", label: "Form heading", max: 120 },
      { kind: "text", name: "formLine", label: "Line under the form heading", max: 200 },
    ],
  },
  {
    title: "WhatsApp card",
    items: [
      { kind: "text", name: "whatsappLabel", label: "WhatsApp card label", max: 60 },
      { kind: "text", name: "whatsappHeading", label: "WhatsApp card heading", max: 120 },
      { kind: "text", name: "whatsappLine", label: "WhatsApp card line", max: 200 },
    ],
  },
];

export function mergeContactContent(content: StoredContent): typeof contact {
  const saved = savedSection(contactSchema, content.contact) as Partial<typeof contact>;
  return { ...contact, ...saved };
}

export function contactFormValues(content: StoredContent) {
  const { title, intro, formHeading, formLine, whatsappLabel, whatsappHeading, whatsappLine } =
    contact;
  return sectionFormValues(contactSchema, content.contact, {
    title,
    intro,
    formHeading,
    formLine,
    whatsappLabel,
    whatsappHeading,
    whatsappLine,
  });
}
