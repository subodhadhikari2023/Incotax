"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/auth";
import { businessFields, validateBusinessDetails, type BusinessFormValues } from "@/lib/business";
import type { SectionErrors, SectionState } from "@/lib/content-section";
import { readStoredContentOrThrow, writeStoredContent } from "@/lib/content-store";

export type BusinessFormState = SectionState<BusinessFormValues>;

export async function saveBusinessDetails(
  _previous: BusinessFormState,
  formData: FormData,
): Promise<BusinessFormState> {
  await requireAdmin();

  const submitted = Object.fromEntries(
    businessFields.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : ""];
    }),
  ) as BusinessFormValues;
  const { values, errors } = validateBusinessDetails(submitted);
  if (Object.keys(errors).length > 0) return { values, errors: errors as SectionErrors };

  try {
    // A save replaces all stored content, so it must start from what is really there.
    const content = await readStoredContentOrThrow();
    const business = Object.fromEntries(Object.entries(values).filter(([, value]) => value));
    await writeStoredContent({ ...content, business });
  } catch (error) {
    console.error("Could not save business details", error);
    return { values, errors: {}, error: "Could not save. Nothing changed; please try again." };
  }

  // Public pages are static; this rebuilds each one on its next visit, with no deploy.
  revalidatePath("/", "layout");
  return { values, errors: {}, saved: true };
}
