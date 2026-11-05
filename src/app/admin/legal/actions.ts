"use server";

import { legalLinks } from "@/content/site";
import { requireAdmin } from "@/lib/admin/auth";
import { saveSection } from "@/lib/admin/save-section";
import type { SectionState, SectionValues } from "@/lib/content-section";
import { legalContentKey, legalSchema } from "@/lib/legal-content";

export async function saveLegalContent(
  slug: string,
  _previous: SectionState<SectionValues>,
  formData: FormData,
): Promise<SectionState<SectionValues>> {
  await requireAdmin();
  if (!legalLinks.some((link) => link.href === `/${slug}`)) {
    throw new Error(`Unknown legal page: ${slug}`);
  }
  return saveSection(legalContentKey(slug), legalSchema, formData);
}
