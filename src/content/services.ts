// Services from "SERVICES REVISED & FINAL.pdf" (00-Requirements). Names and categories only for
// now; plans, included items and prices are added when the service pages are built.
export type CategoryId = "registration" | "compliance-taxation" | "business-licenses";

export type ServiceCategory = { id: CategoryId; name: string };

export type Service = {
  slug: string;
  /** Full name as written in the services PDF. */
  name: string;
  /** Shorter label for menus; defaults to name. */
  shortName?: string;
  category: CategoryId;
};

export const serviceCategories: ServiceCategory[] = [
  { id: "registration", name: "Registration" },
  { id: "compliance-taxation", name: "Business Compliance & Taxation" },
  { id: "business-licenses", name: "Business Licenses" },
];

export const services: Service[] = [
  {
    slug: "private-limited-company-incorporation",
    name: "Private Limited Company Incorporation",
    category: "registration",
  },
  {
    slug: "llp-registration",
    name: "Limited Liability Partnership (LLP) Registration",
    shortName: "LLP Registration",
    category: "registration",
  },
  {
    slug: "opc-registration",
    name: "One Person Company (OPC) Registration",
    shortName: "OPC Registration",
    category: "registration",
  },
  {
    slug: "section-8-company-registration",
    name: "Section 8 Company Registration",
    category: "registration",
  },
  {
    slug: "sole-proprietorship-registration",
    name: "Sole Proprietorship Registration",
    category: "registration",
  },
  {
    slug: "private-limited-annual-compliance",
    name: "Private Limited Company – Annual Compliance",
    category: "compliance-taxation",
  },
  {
    slug: "llp-annual-compliance",
    name: "LLP – Annual Compliance",
    category: "compliance-taxation",
  },
  {
    slug: "change-of-company-name",
    name: "Change of Company Name",
    category: "compliance-taxation",
  },
  { slug: "gst-registration", name: "GST Registration", category: "compliance-taxation" },
  { slug: "gst-return-filing", name: "GST Return Filing", category: "compliance-taxation" },
  {
    slug: "shop-and-establishment-registration",
    name: "Shop & Establishment Registration",
    category: "business-licenses",
  },
  {
    slug: "iec-registration",
    name: "Import Export Code (IEC) Registration",
    shortName: "IEC Registration",
    category: "business-licenses",
  },
  { slug: "iso-certification", name: "ISO Certification", category: "business-licenses" },
  { slug: "rera-registration", name: "RERA Registration", category: "business-licenses" },
  {
    slug: "startup-india-dpiit-recognition",
    name: "Startup India – DPIIT Recognition",
    category: "business-licenses",
  },
  {
    slug: "trademark-registration",
    name: "Trademark Registration",
    category: "business-licenses",
  },
];

export const servicesByCategory = serviceCategories.map((category) => ({
  ...category,
  services: services.filter((s) => s.category === category.id),
}));

export const serviceHref = (slug: string) => `/services/${slug}`;
