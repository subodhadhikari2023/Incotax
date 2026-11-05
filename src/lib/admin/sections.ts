export type AdminSectionLink = {
  group: "Pages" | "Across the site";
  label: string;
  href: string;
  description: string;
};

/** The panel's menu and overview. Pages come first, as editors think of the site page by page. */
export const adminSections: AdminSectionLink[] = [
  {
    group: "Pages",
    label: "Home page",
    href: "/admin/home",
    description: "The headline, stats, clients, how it works, fee text and reviews.",
  },
  {
    group: "Pages",
    label: "Why IncoTax",
    href: "/admin/why-incotax",
    description: "The about text, founder bios, courts and areas of law.",
  },
  {
    group: "Pages",
    label: "Contact page",
    href: "/admin/contact",
    description: "The headline and the text around the form and WhatsApp card.",
  },
  {
    group: "Pages",
    label: "Service pages",
    href: "/admin/services",
    description: "The descriptions and WhatsApp message for each of the 16 services.",
  },
  {
    group: "Pages",
    label: "Legal pages",
    href: "/admin/legal",
    description: "The text of the terms, privacy, refund and other legal pages.",
  },
  {
    group: "Across the site",
    label: "Business details",
    href: "/admin/business",
    description: "The phone, WhatsApp number, email, address and hours shown on every page.",
  },
  {
    group: "Across the site",
    label: "Site-wide text",
    href: "/admin/site",
    description: "The default WhatsApp message, the gold band, enquiry forms and the pop-up.",
  },
];

export const adminSectionGroups = ["Pages", "Across the site"] as const;

export function activeSection(pathname: string) {
  return adminSections.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
}
