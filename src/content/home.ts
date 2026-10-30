// Home page content. Bracketed values are PENDING (checklist rows); replace
// them when Zeeshan sends them.
import type { PlanId } from "./service-details";

export const home = {
  hero: {
    label: "[Short label above the headline]",
    headline: "Turn Your Business Vision Into Reality",
    /** Words of the headline shown in gold italic. PENDING (Zeeshan picks); null = plain headline. */
    goldPhrase: null as string | null,
    text: "Your vision deserves the right foundation — we handle the legal, tax and compliance essentials while you focus on building what matters.",
  },
  stats: [
    { value: "3+", label: "Years of Practice" },
    { value: "150+", label: "Companies Incorporated" },
    { value: "7+", label: "Areas of Legal Expertise" },
    { value: "100%", label: "Commitment to Compliance" },
  ],
  clients: Array.from({ length: 6 }, (_, i) => `[Client ${i + 1} logo / name]`),
  servicesIntro: "[One line introducing the services]",
  /** Services shown on the home page. PENDING (Zeeshan picks); interim default. */
  serviceSlugs: [
    "private-limited-company-incorporation",
    "llp-registration",
    "opc-registration",
    "gst-registration",
    "private-limited-annual-compliance",
    "trademark-registration",
  ],
  howItWorks: {
    heading: "[How it works – heading]",
    intro: "[One line explaining the process]",
  },
  steps: Array.from({ length: 4 }, (_, i) => ({
    title: `[Step ${i + 1} title]`,
    text: "[One line explaining this step]",
  })),
  fees: {
    intro: "[One line about how fees work]",
    serviceSlug: "private-limited-company-incorporation",
    serviceLabel: "Private Limited",
    featuredPlan: "standard" as PlanId,
    featuredTag: "[Tag, e.g. Most chosen]",
    /** Items highlighted on each fee card. PENDING (Zeeshan picks from the PDF lists). */
    highlights: ["[Included item]", "[Included item]", "[Included item]"],
  },
  reviewsIntro: "[One line]",
  reviews: Array.from({ length: 3 }, () => ({
    text: "[Review text goes here. Two to four lines from a client about the service received.]",
    name: "[Client name]",
    detail: "[City / service]",
  })),
};
