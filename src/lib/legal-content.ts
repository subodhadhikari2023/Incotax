import { legal } from "@/content/pages";

import {
  savedSection,
  sectionFormValues,
  type ListRow,
  type SectionSchema,
} from "./content-section";
import type { StoredContent } from "./content-store";

export const legalSchema: SectionSchema = [
  {
    title: "Page details",
    where: "Under the page title, and beside the Contact us button at the end of the page.",
    items: [
      { kind: "text", name: "lastUpdated", label: "Last updated", max: 40 },
      {
        kind: "text",
        name: "questionsLine",
        label: "Questions line",
        max: 200,
        hint: "Shown beside the Contact us button at the end of the page.",
      },
    ],
  },
  {
    title: "Sections",
    where: "The main text of the page. The contents list beside it is built from the headings.",
    items: [
      {
        kind: "list",
        name: "sections",
        row: "section",
        max: 30,
        hint: "With no sections, the page keeps showing its marked placeholders.",
        fields: [
          { name: "heading", label: "heading", max: 150 },
          {
            name: "body",
            label: "text",
            max: 6000,
            optional: true,
            multiline: true,
            hint: "Leave a blank line between paragraphs.",
          },
          {
            name: "list",
            label: "list",
            max: 3000,
            optional: true,
            multiline: true,
            hint: "Optional bullet points, one per line.",
          },
        ],
      },
    ],
  },
];

export const legalContentKey = (slug: string) => `legal/${slug}`;

const paragraphsOf = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const linesOf = (list: string) =>
  list
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function legalContentFor(content: StoredContent, slug: string) {
  const saved = savedSection(legalSchema, content[legalContentKey(slug)]) as {
    lastUpdated?: string;
    questionsLine?: string;
    sections?: ListRow[];
  };
  const sections = saved.sections?.map(({ heading, body, list }) => {
    const items = linesOf(list);
    return {
      heading,
      paragraphs: paragraphsOf(body),
      ...(items.length > 0 ? { list: items } : {}),
    };
  });
  return {
    lastUpdated: saved.lastUpdated ?? legal.lastUpdated,
    questionsLine: saved.questionsLine ?? legal.questionsLine,
    // A legal page with no text would look finished, so it keeps its marked placeholders.
    sections: sections?.length ? sections : legal.sections,
  };
}

export function legalFormValues(content: StoredContent, slug: string) {
  return sectionFormValues(legalSchema, content[legalContentKey(slug)], {
    lastUpdated: legal.lastUpdated,
    questionsLine: legal.questionsLine,
    sections: [],
  });
}
