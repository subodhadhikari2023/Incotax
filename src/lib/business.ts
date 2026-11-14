import { site } from "@/content/site";

import type { StoredContent } from "./content-store";
import type { Nodes } from "./editable-content";
import { EMAIL_FORMAT } from "./enquiry";

export const businessFields = [
  "phone",
  "whatsappNumber",
  "email",
  "address",
  "hours",
  "instagram",
  "facebook",
  "mapLink",
] as const;

export type BusinessField = (typeof businessFields)[number];
export type BusinessFormValues = Record<BusinessField, string>;
export type BusinessErrors = Partial<BusinessFormValues>;

/** What the public pages show: a saved value, or the default from src/content/site.ts. */
export type BusinessDetails = Omit<
  BusinessFormValues,
  "whatsappNumber" | "instagram" | "facebook" | "mapLink"
> & {
  whatsappNumber: string | null;
  instagram?: string;
  facebook?: string;
  mapLink?: string;
};

/** The details a page draws: text in public, editable elements in the admin panel. Social
 * links are addresses, never shown as text, so they stay plain strings. */
export type BusinessNodes = Nodes<
  Omit<BusinessFormValues, "whatsappNumber" | "instagram" | "facebook" | "mapLink">
> & {
  whatsappNumber?: string | null;
  instagram?: string;
  facebook?: string;
  /** The panel's fields for the social links, shown under the footer icons. */
  socialEdit?: React.ReactNode;
};

const defaultSocial = (platform: string) =>
  site.social.find((link) => link.platform === platform)?.href ?? "";

/** The details the admin has saved. Ignores anything unexpected, since this is stored data. */
export function savedBusinessDetails(content: StoredContent): Partial<BusinessFormValues> {
  const business = content.business;
  if (typeof business !== "object" || business === null) return {};
  const stored = business as Record<string, unknown>;
  return Object.fromEntries(
    businessFields.flatMap((field) => {
      const value = stored[field];
      return typeof value === "string" && value ? [[field, value]] : [];
    }),
  );
}

/** Only saved values, so a [placeholder] can't be saved as if it were real. */
export function businessFormValues(content: StoredContent): BusinessFormValues {
  const saved = savedBusinessDetails(content);
  return Object.fromEntries(
    businessFields.map((field) => [field, saved[field] ?? ""]),
  ) as BusinessFormValues;
}

export function mergeBusinessDetails(content: StoredContent): BusinessDetails {
  const { phone, whatsappNumber, email, address, hours } = site;
  return {
    phone,
    whatsappNumber,
    email,
    address,
    hours,
    instagram: defaultSocial("Instagram"),
    facebook: defaultSocial("Facebook"),
    ...savedBusinessDetails(content),
  };
}

const PHONE_FORMAT = /^\+?[\d\s()-]+$/;
const WHATSAPP_SEPARATORS = /[\s()+-]/g;
const MAX_ADDRESS = 300;
const MAX_HOURS = 100;
/** Google Maps share links, place links and embed addresses. */
const MAP_LINK =
  /^https:\/\/(maps\.app\.goo\.gl\/|goo\.gl\/maps\/|(www\.)?google\.[a-z.]+\/maps[/?])[^\s"<>]*$/;
const MAP_EMBED = /^https:\/\/www\.google\.com\/maps\/embed\?/;

/**
 * What the Contact page's map shows: a map in a frame and a link that opens Google Maps. An embed
 * address shows exactly that pin; otherwise the map searches for the office address. Hidden while
 * the address is still a [placeholder] and no link is saved.
 */
export function officeMap(
  address: string,
  mapLink = "",
): { embed: string | null; open: string } | null {
  const realAddress = address && !address.startsWith("[") ? address : "";
  if (!realAddress && !mapLink) return null;
  const query = encodeURIComponent(realAddress);
  const isEmbed = MAP_EMBED.test(mapLink);
  // A share link can't be shown in a frame, so without an address there is only the link.
  const embed = isEmbed
    ? mapLink
    : realAddress
      ? `https://www.google.com/maps?q=${query}&output=embed`
      : null;
  return {
    embed,
    open:
      mapLink && !isEmbed ? mapLink : `https://www.google.com/maps/search/?api=1&query=${query}`,
  };
}

/** A link visitors are sent to: https only, so nothing else (such as javascript:) can be saved. */
const FULL_LINK = /^https:\/\/[^\s"<>]{3,300}$/;

/** Blank is valid for every field: details arrive a few at a time, and blank keeps the default. */
export function validateBusinessDetails(submitted: BusinessFormValues): {
  values: BusinessFormValues;
  errors: BusinessErrors;
} {
  const values = Object.fromEntries(
    businessFields.map((field) => [field, submitted[field].trim()]),
  ) as BusinessFormValues;
  const errors: BusinessErrors = {};

  if (values.phone) {
    const digits = values.phone.replace(/\D/g, "").length;
    if (!PHONE_FORMAT.test(values.phone) || digits < 10 || digits > 15)
      errors.phone = "Please enter a valid phone number.";
  }

  if (values.whatsappNumber) {
    // wa.me needs the country code: a bare 10-digit number would not reach the right person.
    const digits = values.whatsappNumber.replace(WHATSAPP_SEPARATORS, "");
    if (/^\d{11,15}$/.test(digits)) values.whatsappNumber = digits;
    else errors.whatsappNumber = "Please enter the number with its country code, digits only.";
  }

  if (values.email && !EMAIL_FORMAT.test(values.email))
    errors.email = "Please enter a valid email address.";
  if (values.address.length > MAX_ADDRESS)
    errors.address = `Please keep the address under ${MAX_ADDRESS} characters.`;
  if (values.hours.length > MAX_HOURS)
    errors.hours = `Please keep the hours under ${MAX_HOURS} characters.`;
  for (const field of ["instagram", "facebook"] as const) {
    if (values[field] && !FULL_LINK.test(values[field]))
      errors[field] = "Please paste the full link, starting with https://";
  }

  if (values.mapLink) {
    // Google's "Embed a map" gives a whole <iframe>; only its address is kept.
    const embedded = values.mapLink.match(/src="([^"]+)"/)?.[1];
    if (embedded) values.mapLink = embedded;
    if (!MAP_LINK.test(values.mapLink))
      errors.mapLink = "Please paste a Google Maps link, or the code from Share → Embed a map.";
  }

  return { values, errors };
}
