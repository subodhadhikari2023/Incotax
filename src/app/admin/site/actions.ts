"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { saveSection } from "@/lib/admin/save-section";
import type { SectionState, SectionValues } from "@/lib/content-section";
import { siteCopySchema } from "@/lib/site-copy-schema";

export async function saveSiteCopy(
  _previous: SectionState<SectionValues>,
  formData: FormData,
): Promise<SectionState<SectionValues>> {
  await requireAdmin();
  return saveSection("site", siteCopySchema, formData);
}
