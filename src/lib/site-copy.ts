import { savedSection, sectionFormValues } from "./content-section";
import type { StoredContent } from "./content-store";
import { defaultSiteCopy, siteCopySchema, type SiteCopy } from "./site-copy-schema";

export { defaultSiteCopy, siteCopySchema, type SiteCopy };

const d = defaultSiteCopy;

/** What the public pages show: saved values over the defaults in src/content/. */
export function mergeSiteCopy(content: StoredContent): SiteCopy {
  const saved = savedSection(siteCopySchema, content.site) as Record<string, string | undefined>;
  return {
    whatsappMessage: saved.whatsappMessage ?? d.whatsappMessage,
    band: {
      heading: saved.whatsappBandHeading ?? d.band.heading,
      line: saved.whatsappBandLine ?? d.band.line,
    },
    serviceCoversIntro: saved.serviceCoversIntro ?? d.serviceCoversIntro,
    otherServicesIntro: saved.otherServicesIntro ?? d.otherServicesIntro,
    forms: {
      submitLabel: saved.submitLabel ?? d.forms.submitLabel,
      afterSubmit: saved.afterSubmit ?? d.forms.afterSubmit,
      note: saved.formNote ?? d.forms.note,
    },
    popup: {
      label: saved.popupLabel ?? d.popup.label,
      heading: saved.popupHeading ?? d.popup.heading,
      line: saved.popupLine ?? d.popup.line,
      note: saved.popupNote ?? d.popup.note,
    },
  };
}

export function siteCopyFormValues(content: StoredContent) {
  return sectionFormValues(siteCopySchema, content.site, {
    whatsappMessage: d.whatsappMessage ?? "",
    whatsappBandHeading: d.band.heading,
    whatsappBandLine: d.band.line,
    serviceCoversIntro: d.serviceCoversIntro,
    otherServicesIntro: d.otherServicesIntro,
    submitLabel: d.forms.submitLabel,
    afterSubmit: d.forms.afterSubmit,
    formNote: d.forms.note,
    popupLabel: d.popup.label,
    popupHeading: d.popup.heading,
    popupLine: d.popup.line,
    popupNote: d.popup.note,
  });
}
