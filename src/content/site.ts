// Business details shown across the site. Bracketed values are PENDING:
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

// Section copy still PENDING from Zeeshan (checklist rows). Replace each placeholder when it arrives.
export const pageCopy = {
  serviceShortDescription:
    "[Short description: two or three lines saying what this service is and who it is for.]",
  serviceOverviewOne: "[Overview paragraph one: what the service is and when a client needs it.]",
  serviceOverviewTwo:
    "[Overview paragraph two: how the work is done, what the client provides, and how long it takes.]",
  serviceCoversIntro: "[One line introducing what this service covers]",
  otherServicesIntro: "[One line]",
  serviceCardDescription: "[Two or three lines describing this service.]",
  whatsappBandHeading: "[Talk to us on WhatsApp]",
  whatsappBandLine: "[One line: tap the button and the chat opens with a ready message]",
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
