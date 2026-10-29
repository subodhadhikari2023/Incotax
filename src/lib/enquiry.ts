// Enquiry form rules shared by the home pop-up and the Contact form. Both send the details to
// WhatsApp as a pre-filled message (CLAUDE.md §7).
export type EnquiryValues = {
  name: string;
  mobile: string;
  email: string;
  service: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryValues, string>>;

/** Strips +91, spaces and dashes; valid Indian mobiles are 10 digits starting 6–9. */
const normaliseMobile = (mobile: string) =>
  mobile.replace(/[\s-]/g, "").replace(/^\+?91(?=\d{10}$)/, "");

export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (!values.name.trim()) errors.name = "Please enter your full name.";
  if (!values.mobile.trim()) errors.mobile = "Please enter your mobile number.";
  else if (!/^[6-9]\d{9}$/.test(normaliseMobile(values.mobile)))
    errors.mobile = "Please enter a valid 10-digit mobile number.";
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Please enter a valid email address.";
  return errors;
}

/** The WhatsApp message: one line per filled-in field. */
export function enquiryMessage(values: EnquiryValues): string {
  const lines = [
    "New enquiry from the website",
    `Name: ${values.name.trim()}`,
    `Mobile: ${values.mobile.trim()}`,
  ];
  if (values.email.trim()) lines.push(`Email: ${values.email.trim()}`);
  if (values.service) lines.push(`Service: ${values.service}`);
  if (values.message.trim()) lines.push(`Message: ${values.message.trim()}`);
  return lines.join("\n");
}
