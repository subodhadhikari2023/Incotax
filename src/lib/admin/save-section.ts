import { revalidatePath } from "next/cache";

import { readStoredContentOrThrow, writeStoredContent } from "@/lib/content-store";
import {
  parseSectionForm,
  sectionToStore,
  validateSection,
  type SectionErrors,
  type SectionSchema,
  type SectionState,
  type SectionValues,
} from "@/lib/content-section";

/**
 * Checks a submitted form and saves it under one key of the content store. Callers must have
 * called requireAdmin() first. `check` adds rules that involve more than one field.
 */
export async function saveSection<V extends SectionValues>(
  key: string,
  schema: SectionSchema,
  formData: FormData,
  check?: (values: V) => SectionErrors,
): Promise<SectionState<V>> {
  const validated = validateSection(schema, parseSectionForm(schema, formData));
  const values = validated.values as V;
  const errors = { ...validated.errors, ...check?.(values) };
  if (Object.keys(errors).length > 0) return { values, errors };

  try {
    // A save replaces all stored content, so it must start from what is really there.
    const content = await readStoredContentOrThrow();
    await writeStoredContent({ ...content, [key]: sectionToStore(values) });
  } catch (error) {
    console.error(`Could not save ${key}`, error);
    return { values, errors: {}, error: "Could not save. Nothing changed; please try again." };
  }

  // Public pages are static; this rebuilds each one on its next visit, with no deploy.
  revalidatePath("/", "layout");
  return { values, errors: {}, saved: true };
}
