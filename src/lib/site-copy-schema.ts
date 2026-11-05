import { forms, popup } from "@/content/pages";
import { pageCopy, site } from "@/content/site";

import type { SectionSchema } from "./content-section";

export type SiteCopy = {
  whatsappMessage: string | null;
  band: { heading: string; line: string };
  serviceCoversIntro: string;
  otherServicesIntro: string;
  forms: typeof forms;
  popup: typeof popup;
};

export const defaultSiteCopy: SiteCopy = {
  whatsappMessage: site.whatsappMessage,
  band: { heading: pageCopy.whatsappBandHeading, line: pageCopy.whatsappBandLine },
  serviceCoversIntro: pageCopy.serviceCoversIntro,
  otherServicesIntro: pageCopy.otherServicesIntro,
  forms,
  popup,
};

export const siteCopySchema: SectionSchema = [
  {
    title: "WhatsApp",
    where: "On every WhatsApp button, and in the gold band near the bottom of most pages.",
    items: [
      {
        kind: "text",
        name: "whatsappMessage",
        label: "Default WhatsApp message",
        max: 500,
        multiline: true,
        hint: "Pre-filled in the chat. A service page uses its own message if it has one.",
      },
      { kind: "text", name: "whatsappBandHeading", label: "WhatsApp band heading", max: 120 },
      { kind: "text", name: "whatsappBandLine", label: "WhatsApp band line", max: 200 },
    ],
  },
  {
    title: "Service pages",
    where: "On every service page, above what is included and above the other services.",
    items: [
      {
        kind: "text",
        name: "serviceCoversIntro",
        label: "Intro above what a service covers",
        max: 200,
      },
      { kind: "text", name: "otherServicesIntro", label: "Intro above other services", max: 200 },
    ],
  },
  {
    title: "Enquiry forms",
    where: "On the Contact page form and the home page pop-up form.",
    href: "/contact#form-heading",
    items: [
      { kind: "text", name: "submitLabel", label: "Form submit button", max: 40 },
      {
        kind: "text",
        name: "afterSubmit",
        label: "Message after a form is sent",
        max: 300,
        multiline: true,
      },
      { kind: "text", name: "formNote", label: "Note under the contact form", max: 200 },
    ],
  },
  {
    title: "Pop-up",
    where: "The enquiry form that opens over the home page when someone first visits.",
    href: "/",
    items: [
      { kind: "text", name: "popupLabel", label: "Pop-up label", max: 60 },
      { kind: "text", name: "popupHeading", label: "Pop-up heading", max: 120 },
      { kind: "text", name: "popupLine", label: "Pop-up line", max: 200 },
      { kind: "text", name: "popupNote", label: "Note under the pop-up form", max: 200 },
    ],
  },
];
