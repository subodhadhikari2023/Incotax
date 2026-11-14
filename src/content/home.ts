// Home page content. Bracketed values are PENDING (checklist rows); replace
// them when Zeeshan sends them.
import type { PlanId } from "./service-details";

export const home = {
  hero: {
    label: "You Grow. We Handle The Rest.",
    headline: "Turn Your Business Vision Into Reality",
    /** Words of the headline shown in gold italic; null = plain headline. */
    goldPhrase: "Reality" as string | null,
    text: "Your vision deserves the right foundation — we handle the legal, tax and compliance essentials while you focus on building what matters.",
  },
  stats: [
    { value: "3+", label: "Years of Practice" },
    { value: "150+", label: "Companies Incorporated" },
    { value: "7+", label: "Areas of Legal Expertise" },
    { value: "100%", label: "Commitment to Compliance" },
  ],
  clients: [
    "Eagle NextGen",
    "Cerebral Compass",
    "Agarwal Steel",
    "Maya Traders",
    "TrendVish Media",
    "Sky Digital Network",
  ],
  /** Logo files in public/clients, by client name. A client without one shows its name. */
  clientLogos: {
    "Eagle NextGen": "/clients/eagle-nextgen.webp",
    "Cerebral Compass": "/clients/cerebral-compass.webp",
    "Agarwal Steel": "/clients/agarwal-steel.webp",
    "Maya Traders": "/clients/maya-traders.webp",
    "TrendVish Media": "/clients/trendvish-media.webp",
    "Sky Digital Network": "/clients/sky-digital-network.webp",
  } as Record<string, string>,
  servicesIntro: "Complete Business & Compliance Solutions",
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
    heading: "How It Works",
    intro:
      "Get started with IncoTax in four simple steps with expert guidance and hassle-free business support.",
  },
  steps: [
    {
      title: "Understanding Your Requirements",
      text: "We understand your business needs and identify the right services for you.",
    },
    {
      title: "Document Collection & Verification",
      text: "We collect and verify the necessary documents to ensure a smooth process.",
    },
    {
      title: "Registration & Compliance Filing",
      text: "Our team handles the required applications, registrations and compliance filings.",
    },
    {
      title: "Government Review & Approval",
      text: "The concerned government authority reviews your application and processes the approval.",
    },
  ],
  fees: {
    intro: "Transparent Pricing, No Surprises",
    serviceSlug: "private-limited-company-incorporation",
    serviceLabel: "Private Limited",
    featuredPlan: "standard" as PlanId,
    featuredTag: "Most Popular",
    /** Items highlighted on each fee card. PENDING (Zeeshan picks from the PDF lists). */
    highlights: ["[Included item]", "[Included item]", "[Included item]"],
  },
  reviewsIntro: "Trusted Feedback, Real Experiences",
  /** Real client reviews only; with none the section is hidden. */
  reviews: [] as { text: string; name: string; detail: string }[],
};
