"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { saveSection } from "@/lib/admin/save-section";
import type { SectionState, SectionValues } from "@/lib/content-section";
import { whyIncotaxSchema } from "@/lib/pages-content";

export async function saveWhyIncotaxContent(
  _previous: SectionState<SectionValues>,
  formData: FormData,
): Promise<SectionState<SectionValues>> {
  await requireAdmin();
  return saveSection("whyIncotax", whyIncotaxSchema, formData);
}
