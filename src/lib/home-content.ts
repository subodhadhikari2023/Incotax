import { home } from "@/content/home";

import {
  parseSectionForm,
  savedSection,
  sectionFormValues,
  validateSection,
  type SectionErrors,
} from "./content-section";
import type { StoredContent } from "./content-store";
import type { Nodes } from "./editable-content";
import { homeListLimits, homeSchema, type HomeFormValues } from "./home-schema";

export { homeListLimits, homeSchema, type HomeFormValues };

export type HomeContent = typeof home;

/** What the home sections draw: text in public, editable elements in the admin panel. */
export type HomeNodes = Omit<Nodes<HomeContent>, "serviceSlugs" | "fees"> & {
  serviceSlugs: string[];
  fees: Omit<Nodes<HomeContent["fees"]>, "serviceSlug" | "serviceLabel"> & {
    serviceSlug: string;
    serviceLabel: string;
  };
};

const defaults: HomeFormValues = {
  heroLabel: home.hero.label,
  headline: home.hero.headline,
  goldPhrase: home.hero.goldPhrase ?? "",
  heroText: home.hero.text,
  servicesIntro: home.servicesIntro,
  howHeading: home.howItWorks.heading,
  howIntro: home.howItWorks.intro,
  feesIntro: home.fees.intro,
  featuredTag: home.fees.featuredTag,
  reviewsIntro: home.reviewsIntro,
  stats: home.stats,
  clients: home.clients.map((name) => ({ name })),
  steps: home.steps,
  highlights: home.fees.highlights.map((text) => ({ text })),
  reviews: home.reviews,
};

/** What the public pages show: saved values over the defaults in src/content/home.ts. */
export function mergeHomeContent(content: StoredContent): HomeContent {
  const saved = savedSection(homeSchema, content.home) as Partial<HomeFormValues>;
  return {
    ...home,
    hero: {
      label: saved.heroLabel ?? home.hero.label,
      headline: saved.headline ?? home.hero.headline,
      goldPhrase: saved.goldPhrase ?? home.hero.goldPhrase,
      text: saved.heroText ?? home.hero.text,
    },
    stats: (saved.stats as HomeContent["stats"]) ?? home.stats,
    clients: saved.clients?.map((client) => client.name) ?? home.clients,
    servicesIntro: saved.servicesIntro ?? home.servicesIntro,
    howItWorks: {
      heading: saved.howHeading ?? home.howItWorks.heading,
      intro: saved.howIntro ?? home.howItWorks.intro,
    },
    steps: (saved.steps as HomeContent["steps"]) ?? home.steps,
    fees: {
      ...home.fees,
      intro: saved.feesIntro ?? home.fees.intro,
      featuredTag: saved.featuredTag ?? home.fees.featuredTag,
      highlights: saved.highlights?.map((row) => row.text) ?? home.fees.highlights,
    },
    reviewsIntro: saved.reviewsIntro ?? home.reviewsIntro,
    reviews: (saved.reviews as HomeContent["reviews"]) ?? home.reviews,
  };
}

export function homeFormValues(content: StoredContent): HomeFormValues {
  return sectionFormValues(homeSchema, content.home, defaults) as HomeFormValues;
}

export function parseHomeForm(data: FormData): HomeFormValues {
  return parseSectionForm(homeSchema, data) as HomeFormValues;
}

/** The gold words are found in the headline when the page renders, so they must really be in it. */
export function checkGoldPhrase({ goldPhrase, headline }: HomeFormValues): SectionErrors {
  if (!goldPhrase || (headline || home.hero.headline).includes(goldPhrase)) return {};
  return { goldPhrase: "Those words are not in the headline. Copy them from it exactly." };
}

export function validateHomeContent(submitted: HomeFormValues) {
  const { values, errors } = validateSection(homeSchema, submitted);
  return {
    values: values as HomeFormValues,
    errors: { ...errors, ...checkGoldPhrase(values as HomeFormValues) },
  };
}
