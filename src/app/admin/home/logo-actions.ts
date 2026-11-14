"use server";

import { randomBytes } from "node:crypto";

import { requireAdmin } from "@/lib/admin/auth";
import { checkPhoto } from "@/lib/admin/photo";
import { writeMedia } from "@/lib/media-store";

// Stores a client logo as soon as it is chosen and returns its address. Clients can be added,
// removed and reordered before saving, so the logo is tied to its row by address rather than by
// position; the row only keeps it once the page is saved.
export async function uploadClientLogo(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  await requireAdmin();

  const file = formData.get("logo");
  if (!(file instanceof File)) return { error: "Please choose an image." };
  const checked = await checkPhoto(file);
  if ("error" in checked) return { error: String(checked.error) };

  const name = `client-${randomBytes(8).toString("hex")}`;
  try {
    await writeMedia(name, checked.bytes);
  } catch (error) {
    console.error("Could not store a client logo", error);
    return { error: "Could not upload the logo. Please try again." };
  }
  return { url: `/media/${name}?v=${Date.now().toString(36)}` };
}
