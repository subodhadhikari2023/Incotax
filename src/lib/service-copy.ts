import {
  defaultServiceDetail,
  PLANS,
  type PlanId,
  type PriceRow,
  type ServiceDetail,
} from "@/content/service-details";
import { getService, whatsappMessageFor } from "@/content/services";
import { pageCopy } from "@/content/site";

import {
  savedSection,
  sectionFormValues,
  type ListRow,
  type SectionErrors,
  type SectionSchema,
  type SectionValues,
} from "./content-section";
import type { StoredContent } from "./content-store";
import { formatINR } from "./format";
import { catalogEntry, publicServices } from "./service-catalog";

export const serviceCopySchema: SectionSchema = [
  {
    title: "Page text",
    items: [
      { kind: "text", name: "name", label: "Service name", max: 150 },
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
    title: "Fee",
    items: [
      { kind: "text", name: "pricingKind", label: "How this fee is shown", max: 10 },
      { kind: "text", name: "amount", label: "Fee amount", max: 15 },
      { kind: "text", name: "suffix", label: "Line under the fee", max: 100 },
      { kind: "text", name: "quoteText", label: "Fee text", max: 300, multiline: true },
      { kind: "text", name: "priceBasic", label: "Basic price", max: 15 },
      { kind: "text", name: "priceStandard", label: "Standard price", max: 15 },
      { kind: "text", name: "pricePremium", label: "Premium price", max: 15 },
      {
        kind: "list",
        name: "priceRows",
        row: "price row",
        max: 20,
        fields: [
          { name: "label", label: "label", max: 100 },
          { name: "value", label: "value", max: 60 },
        ],
      },
      { kind: "text", name: "notIncluded", label: "Not included", max: 600, multiline: true },
    ],
  },
  {
    title: "Details",
    items: [
      { kind: "text", name: "timeline", label: "Estimated timeline", max: 400, multiline: true },
      { kind: "text", name: "note", label: "Please note", max: 1000, multiline: true },
      {
        kind: "list",
        name: "included",
        row: "included item",
        max: 40,
        fields: [
          { name: "name", label: "name", max: 150 },
          { name: "description", label: "description", max: 1000, optional: true, multiline: true },
          // Comma-separated plan ids; blank means every plan. Set with tick boxes, not typed.
          { name: "plans", label: "plans", max: 40, optional: true },
        ],
      },
      // Marks a save as holding these details, so a cleared line stays cleared.
      { kind: "text", name: "detailsEdited", label: "Details edited", max: 1 },
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
      saved.overviewOne ?? defaultServiceDetail(slug).overview ?? pageCopy.serviceOverviewOne,
    overviewTwo: saved.overviewTwo ?? pageCopy.serviceOverviewTwo,
    cardDescription: saved.cardDescription ?? pageCopy.serviceCardDescription,
    whatsappMessage: saved.whatsappMessage ?? (service ? whatsappMessageFor(service) : null),
  };
}

const PRICE_KEYS: Record<PlanId, string> = {
  basic: "priceBasic",
  standard: "priceStandard",
  premium: "pricePremium",
};
const PRICING_KINDS = ["plans", "from", "fixed", "quote"];
const planIds = PLANS.map((plan) => plan.id);

const parsePrice = (text: string | undefined) => Number((text ?? "").replace(/,/g, ""));
const isPrice = (text: string) => /^\d[\d,]*$/.test(text);
const NOT_A_PRICE = "Please enter a whole number, for example 1499.";

/** Rules that depend on how the fee is shown, on top of the schema's own. */
export function checkServiceDetails(values: SectionValues): SectionErrors {
  const errors: SectionErrors = {};
  const kind = values.pricingKind as string;
  if (!PRICING_KINDS.includes(kind)) errors.pricingKind = "Please choose how this fee is shown.";
  if ((kind === "from" || kind === "fixed") && !isPrice(values.amount as string)) {
    errors.amount = NOT_A_PRICE;
  }
  if (kind === "plans") {
    for (const key of Object.values(PRICE_KEYS)) {
      if (!isPrice((values[key] as string) ?? "")) errors[key] = NOT_A_PRICE;
    }
  }
  ((values.included as ListRow[]) ?? []).forEach((row, i) => {
    const plans = row.plans ? row.plans.split(",") : [];
    if (plans.some((plan) => !planIds.includes(plan as PlanId))) {
      errors[`included.${i}.plans`] = "Please choose from the plans listed.";
    }
  });
  return errors;
}

/** What a service page shows beyond its text: saved details, or those in src/content. */
export function serviceDetailFor(content: StoredContent, slug: string): ServiceDetail {
  const saved = savedFor(content, slug) as Record<string, string & ListRow[]>;
  if (!saved.detailsEdited) return defaultServiceDetail(slug);

  const kind: string = saved.pricingKind;
  const plans = PLANS.map((plan) => ({ ...plan, price: parsePrice(saved[PRICE_KEYS[plan.id]]) }));
  const included = (saved.included ?? []).map(({ name, description, plans: tags }) => ({
    name,
    description,
    ...(tags ? { plans: tags.split(",") as PlanId[] } : {}),
  }));
  const pricing: ServiceDetail["pricing"] =
    kind === "plans"
      ? {
          kind: "from",
          amount: Math.min(...plans.map((plan) => plan.price)),
          rows: plans.map((plan) => ({ label: plan.name, value: formatINR(plan.price) })),
        }
      : kind === "from" || kind === "fixed"
        ? {
            kind,
            amount: parsePrice(saved.amount),
            suffix: saved.suffix,
            rows: (saved.priceRows ?? []) as unknown as PriceRow[],
          }
        : { kind: "quote", text: saved.quoteText ?? "" };

  return {
    included,
    ...(kind === "plans" ? { plans } : {}),
    pricing,
    notIncluded: saved.notIncluded,
    timeline: saved.timeline,
    note: saved.note,
  };
}

function detailDefaults(slug: string) {
  const detail = defaultServiceDetail(slug);
  const { pricing, plans } = detail;
  const planPrice = (id: PlanId) => {
    const plan = plans?.find((each) => each.id === id);
    return plan ? String(plan.price) : "";
  };
  return {
    pricingKind: plans ? "plans" : pricing.kind,
    amount: pricing.kind !== "quote" && !plans ? String(pricing.amount) : "",
    suffix: (pricing.kind !== "quote" && pricing.suffix) || "",
    quoteText: pricing.kind === "quote" ? pricing.text : "",
    priceBasic: planPrice("basic"),
    priceStandard: planPrice("standard"),
    pricePremium: planPrice("premium"),
    priceRows: pricing.kind !== "quote" && !plans ? pricing.rows : [],
    notIncluded: detail.notIncluded ?? "",
    timeline: detail.timeline ?? "",
    note: detail.note ?? "",
    included: detail.included.map((item) => ({
      name: item.name,
      description: item.description,
      plans: item.plans?.join(",") ?? "",
    })),
    detailsEdited: "1",
  };
}

export function serviceCardDescriptions(content: StoredContent): Record<string, string> {
  return Object.fromEntries(
    publicServices(content).map(({ slug }) => [
      slug,
      savedFor(content, slug).cardDescription ?? pageCopy.serviceCardDescription,
    ]),
  );
}

export function serviceCopyFormValues(content: StoredContent, slug: string) {
  return sectionFormValues(serviceCopySchema, content[serviceCopyKey(slug)], {
    name: catalogEntry(content, slug)?.name ?? "",
    shortDescription: pageCopy.serviceShortDescription,
    overviewOne: defaultServiceDetail(slug).overview ?? pageCopy.serviceOverviewOne,
    overviewTwo: pageCopy.serviceOverviewTwo,
    cardDescription: pageCopy.serviceCardDescription,
    whatsappMessage: getService(slug)?.whatsappMessage ?? "",
    ...detailDefaults(slug),
  });
}
