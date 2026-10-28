// Business details shown across the site. Bracketed values are PENDING (CLAUDE.md §10):
// replace them here when Zeeshan sends the real details.
export const site = {
  name: "IncoTax Legal Services",
  tagline: "Your Trust, Our Commitment!",
  phone: "[Phone number]",
  email: "[Email address]",
  address: "[Office address]",
  hours: "[Working days], 10 AM to 8 PM",
  socialLinks: "[Social links]",
  /** Digits with country code, e.g. "919876543210". null until the number arrives. */
  whatsappNumber: null as string | null,
  /** Pre-filled WhatsApp message. null until Zeeshan writes it. */
  whatsappMessage: null as string | null,
};

export type NavLink = { label: string; href: string };

export const quickLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Why IncoTax", href: "/why-incotax" },
  { label: "Contact Us", href: "/contact" },
];

export const legalLinks: NavLink[] = [
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Grievance Redressal", href: "/grievance-redressal" },
];
