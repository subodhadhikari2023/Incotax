"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { saveSection } from "@/lib/admin/save-section";
import type { SectionState, SectionValues } from "@/lib/content-section";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { catalogEntry } from "@/lib/service-catalog";
import { checkServiceDetails, serviceCopyKey, serviceCopySchema } from "@/lib/service-copy";

export async function saveServiceCopy(
  slug: string,
  _previous: SectionState<SectionValues>,
  formData: FormData,
): Promise<SectionState<SectionValues>> {
  await requireAdmin();
  if (!catalogEntry(await readStoredContentOrThrow(), slug)) {
    throw new Error(`Unknown service: ${slug}`);
  }
  return saveSection(serviceCopyKey(slug), serviceCopySchema, formData, checkServiceDetails);
}
