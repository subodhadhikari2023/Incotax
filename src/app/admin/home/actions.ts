"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { saveSection } from "@/lib/admin/save-section";
import type { SectionState } from "@/lib/content-section";
import { checkGoldPhrase, homeSchema, type HomeFormValues } from "@/lib/home-content";

export async function saveHomeContent(
  _previous: SectionState<HomeFormValues>,
  formData: FormData,
): Promise<SectionState<HomeFormValues>> {
  await requireAdmin();
  return saveSection("home", homeSchema, formData, checkGoldPhrase);
}
