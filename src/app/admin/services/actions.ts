"use server";

import { getService } from "@/content/services";
import { requireAdmin } from "@/lib/admin/auth";
import { saveSection } from "@/lib/admin/save-section";
import type { SectionState, SectionValues } from "@/lib/content-section";
import { checkServiceDetails, serviceCopyKey, serviceCopySchema } from "@/lib/service-copy";

export async function saveServiceCopy(
  slug: string,
  _previous: SectionState<SectionValues>,
  formData: FormData,
): Promise<SectionState<SectionValues>> {
  await requireAdmin();
  if (!getService(slug)) throw new Error(`Unknown service: ${slug}`);
  return saveSection(serviceCopyKey(slug), serviceCopySchema, formData, checkServiceDetails);
}
