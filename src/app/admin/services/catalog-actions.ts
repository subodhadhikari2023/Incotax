"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { serviceCategories, type CategoryId } from "@/content/services";
import { requireAdmin } from "@/lib/admin/auth";
import {
  readStoredContentOrThrow,
  writeStoredContent,
  type StoredContent,
} from "@/lib/content-store";
import {
  addService,
  allCatalogEntries,
  catalogEntry,
  deleteDraft,
  hideService,
  publishService,
  restoreService,
  toggleHomeService,
} from "@/lib/service-catalog";

export type AddServiceState = { errors: Record<string, string> } | undefined;

const MAX_NAME = 150;

export async function createService(
  _previous: AddServiceState,
  formData: FormData,
): Promise<AddServiceState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  // A save replaces all stored content, so it must start from what is really there.
  const content = await readStoredContentOrThrow();

  const taken = allCatalogEntries(content).map((entry) => entry.name.toLowerCase());
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please enter a name.";
  else if (name.length > MAX_NAME)
    errors.name = `Please keep the name under ${MAX_NAME} characters.`;
  else if (taken.includes(name.toLowerCase()))
    errors.name = "A service with this name already exists.";
  if (!serviceCategories.some((each) => each.id === category)) {
    errors.category = "Please choose a category.";
  }
  if (Object.keys(errors).length > 0) return { errors };

  const { content: updated, slug } = addService(content, name, category as CategoryId);
  await writeStoredContent(updated);
  revalidatePath("/", "layout");
  redirect(`/admin/services/${slug}`);
}

async function change(slug: string, apply: (content: StoredContent) => StoredContent) {
  await requireAdmin();
  const content = await readStoredContentOrThrow();
  if (!catalogEntry(content, slug)) throw new Error(`Unknown service: ${slug}`);
  await writeStoredContent(apply(content));
  // Menus, forms and cards on every page list the services.
  revalidatePath("/", "layout");
}

export async function publishServiceAction(slug: string) {
  await change(slug, (content) => publishService(content, slug));
}

export async function hideServiceAction(slug: string) {
  await change(slug, (content) => hideService(content, slug));
}

export async function restoreServiceAction(slug: string) {
  await change(slug, (content) => restoreService(content, slug));
}

export async function deleteServiceDraft(slug: string) {
  await change(slug, (content) => deleteDraft(content, slug));
}

export async function toggleHomeServiceAction(slug: string) {
  await change(slug, (content) => toggleHomeService(content, slug));
}
