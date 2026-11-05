import { getServiceDetail } from "@/content/service-details";
import { getService, services, whatsappMessageFor } from "@/content/services";
import { pageCopy } from "@/content/site";

import { savedSection, sectionFormValues, type SectionSchema } from "./content-section";
import type { StoredContent } from "./content-store";

// Prices, plans and included items stay in src/content: they are the firm's published fees.
export const serviceCopySchema: SectionSchema = [
  {
    title: "Page text",
    items: [
      {
        kind: "text",
        name: "shortDescription",
        label: "Short description",
        max: 400,
        multiline: true,
      },
      {
        kind: "text",
        name: "overviewOne",
        label: "Overview paragraph one",
        max: 1500,
        multiline: true,
      },
      {
        kind: "text",
        name: "overviewTwo",
        label: "Overview paragraph two",
        max: 1500,
        multiline: true,
      },
    ],
  },
  {
    title: "Card and WhatsApp",
    items: [
      {
        kind: "text",
        name: "cardDescription",
        label: "Card description",
        max: 300,
        multiline: true,
        hint: "Shown on this service's card on the home page and other service pages.",
      },
      {
        kind: "text",
        name: "whatsappMessage",
        label: "WhatsApp message",
        max: 500,
        multiline: true,
        hint: "Pre-filled in the chat from this service's page. Blank uses the default message.",
      },
    ],
  },
];

export const serviceCopyKey = (slug: string) => `services/${slug}`;

type Saved = Partial<Record<string, string>>;
const savedFor = (content: StoredContent, slug: string) =>
  savedSection(serviceCopySchema, content[serviceCopyKey(slug)]) as Saved;

export function serviceCopyFor(content: StoredContent, slug: string) {
  const saved = savedFor(content, slug);
  const service = getService(slug);
  return {
    shortDescription: saved.shortDescription ?? pageCopy.serviceShortDescription,
    overviewOne:
      saved.overviewOne ?? getServiceDetail(slug).overview ?? pageCopy.serviceOverviewOne,
    overviewTwo: saved.overviewTwo ?? pageCopy.serviceOverviewTwo,
    cardDescription: saved.cardDescription ?? pageCopy.serviceCardDescription,
    whatsappMessage: saved.whatsappMessage ?? (service ? whatsappMessageFor(service) : null),
  };
}

export function serviceCardDescriptions(content: StoredContent): Record<string, string> {
  return Object.fromEntries(
    services.map(({ slug }) => [
      slug,
      savedFor(content, slug).cardDescription ?? pageCopy.serviceCardDescription,
    ]),
  );
}

export function serviceCopyFormValues(content: StoredContent, slug: string) {
  return sectionFormValues(serviceCopySchema, content[serviceCopyKey(slug)], {
    shortDescription: pageCopy.serviceShortDescription,
    overviewOne: getServiceDetail(slug).overview ?? pageCopy.serviceOverviewOne,
    overviewTwo: pageCopy.serviceOverviewTwo,
    cardDescription: pageCopy.serviceCardDescription,
    whatsappMessage: getService(slug)?.whatsappMessage ?? "",
  });
}
