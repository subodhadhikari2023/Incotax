import type { EditorSection, EditorSetting } from "@/components/admin/editor/PageEditor";
import { whyIncotax } from "@/content/pages";
import { businessFormValues } from "@/lib/business";
import { businessSchema } from "@/lib/business-schema";
import type { StoredContent } from "@/lib/content-store";
import { homeFormValues, homeSchema } from "@/lib/home-content";
import { legalContentKey, legalFormValues, legalSchema } from "@/lib/legal-content";
import {
  contactFormValues,
  contactSchema,
  whyIncotaxFormValues,
  whyIncotaxSchema,
} from "@/lib/pages-content";
import { serviceCopyFormValues, serviceCopyKey, serviceCopySchema } from "@/lib/service-copy";
import { siteCopyFormValues, siteCopySchema } from "@/lib/site-copy";

import { saveBusinessDetails } from "./business/actions";
import { saveContactContent } from "./contact/actions";
import { saveHomeContent } from "./home/actions";
import { saveLegalContent } from "./legal/actions";
import { saveServiceCopy } from "./services/actions";
import { saveSiteCopy } from "./site/actions";
import { saveWhyIncotaxContent } from "./why-incotax/actions";
import { saveFounderPhoto } from "./why-incotax/photo-actions";

// What each editor page can change, and how each part is saved.

export const homeSection = (stored: StoredContent): EditorSection => ({
  key: "home",
  schema: homeSchema,
  action: saveHomeContent,
  initial: homeFormValues(stored),
});

export const whyIncotaxSection = (stored: StoredContent): EditorSection => ({
  key: "whyIncotax",
  schema: whyIncotaxSchema,
  action: saveWhyIncotaxContent,
  initial: whyIncotaxFormValues(stored),
});

export const founderPhotoSections = (stored: StoredContent): EditorSection[] =>
  whyIncotax.founders.map((_, i) => ({
    key: `founderPhoto/${i}`,
    schema: [],
    action: saveFounderPhoto.bind(null, i),
    initial: {
      version: String((stored.founderPhotos as Record<string, unknown> | undefined)?.[i] ?? ""),
    },
  }));

export const contactSection = (stored: StoredContent): EditorSection => ({
  key: "contact",
  schema: contactSchema,
  action: saveContactContent,
  initial: contactFormValues(stored),
});

export const serviceSection = (stored: StoredContent, slug: string): EditorSection => ({
  key: serviceCopyKey(slug),
  schema: serviceCopySchema,
  action: saveServiceCopy.bind(null, slug),
  initial: serviceCopyFormValues(stored, slug),
});

export const legalSection = (stored: StoredContent, slug: string): EditorSection => ({
  key: legalContentKey(slug),
  schema: legalSchema,
  action: saveLegalContent.bind(null, slug),
  initial: legalFormValues(stored, slug),
});

/** On every page: the top bar and footer are business details, the gold band is site-wide text. */
export const sharedSections = (stored: StoredContent): EditorSection[] => [
  {
    key: "business",
    schema: businessSchema,
    action: saveBusinessDetails,
    initial: businessFormValues(stored),
  },
  {
    key: "site",
    schema: siteCopySchema,
    action: saveSiteCopy,
    initial: siteCopyFormValues(stored),
  },
];

export const sharedSettings: EditorSetting[] = [
  { section: "business", name: "whatsappNumber" },
  { section: "site", name: "whatsappMessage" },
];
