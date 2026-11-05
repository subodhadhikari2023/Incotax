"use server";

import { revalidatePath } from "next/cache";

import { whyIncotax } from "@/content/pages";
import { requireAdmin } from "@/lib/admin/auth";
import { checkPhoto } from "@/lib/admin/photo";
import type { SectionState } from "@/lib/content-section";
import { readStoredContentOrThrow, writeStoredContent } from "@/lib/content-store";
import { deleteMedia, writeMedia } from "@/lib/media-store";

type PhotoState = SectionState<{ version: string }>;

/** Saves, replaces or removes one founder's photo, keeping the page's other content. */
export async function saveFounderPhoto(
  index: number,
  _previous: PhotoState,
  formData: FormData,
): Promise<PhotoState> {
  await requireAdmin();
  if (!whyIncotax.founders[index]) throw new Error(`Unknown founder: ${index}`);

  const remove = formData.get("removePhoto") === "1";
  const file = formData.get("photo");
  let bytes: Uint8Array | null = null;
  if (!remove) {
    if (!(file instanceof File)) {
      return { values: { version: "" }, errors: { photo: "Please choose an image." } };
    }
    const checked = await checkPhoto(file);
    if ("error" in checked) {
      return { values: { version: "" }, errors: { photo: String(checked.error) } };
    }
    bytes = checked.bytes;
  }

  const version = remove ? "" : Date.now().toString(36);
  try {
    // A save replaces all stored content, so it must start from what is really there.
    const content = await readStoredContentOrThrow();
    const photos = { ...(content.founderPhotos as Record<string, string> | undefined) };
    if (bytes) {
      await writeMedia(`founder-${index}`, bytes);
      photos[index] = version;
    } else {
      await deleteMedia(`founder-${index}`);
      delete photos[index];
    }
    await writeStoredContent({ ...content, founderPhotos: photos });
  } catch (error) {
    console.error(`Could not save founder ${index}'s photo`, error);
    return {
      values: { version: "" },
      errors: {},
      error: "Could not save. Nothing changed; please try again.",
    };
  }

  // Public pages are static; this rebuilds each one on its next visit, with no deploy.
  revalidatePath("/", "layout");
  return { values: { version }, errors: {}, saved: true };
}
