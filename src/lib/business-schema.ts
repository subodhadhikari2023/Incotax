import type { SectionSchema } from "./content-section";

// The action checks these fields itself (validateBusinessDetails), so `max` is only descriptive.
export const businessSchema: SectionSchema = [
  {
    title: "Contact details",
    items: [
      { kind: "text", name: "phone", label: "Phone", max: 30, inputType: "tel" },
      {
        kind: "text",
        name: "whatsappNumber",
        label: "WhatsApp number",
        max: 30,
        inputType: "tel",
        hint: "With the country code, for example 91 and then the 10-digit number.",
      },
      { kind: "text", name: "email", label: "Email", max: 254, inputType: "email" },
      { kind: "text", name: "address", label: "Office address", max: 300, multiline: true },
      {
        kind: "text",
        name: "hours",
        label: "Hours",
        max: 100,
        hint: "Working days and times, as visitors should read them.",
      },
    ],
  },
];
