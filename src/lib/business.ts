import { site } from "@/content/site";

import { readStoredContent, type StoredContent } from "./content-store";
import { EMAIL_FORMAT } from "./enquiry";

export const businessFields = ["phone", "whatsappNumber", "email", "address", "hours"] as const;

export type BusinessField = (typeof businessFields)[number];
export type BusinessFormValues = Record<BusinessField, string>;
export type BusinessErrors = Partial<BusinessFormValues>;

/** What the public pages show: a saved value, or the default from src/content/site.ts. */
export type BusinessDetails = Omit<BusinessFormValues, "whatsappNumber"> & {
  whatsappNumber: string | null;
};

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

export function mergeBusinessDetails(content: StoredContent): BusinessDetails {
  const { phone, whatsappNumber, email, address, hours } = site;
  return {
    phone,
    whatsappNumber,
    email,
    address,
    hours,
    ...savedBusinessDetails(content),
  };
}

export async function getBusinessDetails(): Promise<BusinessDetails> {
  return mergeBusinessDetails(await readStoredContent());
}

const PHONE_FORMAT = /^\+?[\d\s()-]+$/;
const WHATSAPP_SEPARATORS = /[\s()+-]/g;
const MAX_ADDRESS = 300;
const MAX_HOURS = 100;

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

  return { values, errors };
}
