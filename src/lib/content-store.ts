import { readFile, writeFile } from "node:fs/promises";

import { blobsRequired, blobStore, withTimeout } from "./blob-store";

/** What the admin panel has saved. Anything not saved here falls back to src/content/. */
export type StoredContent = Record<string, unknown>;

const KEY = "content";

const STORE = "site-content";

/** The saved value, or undefined if nothing has been saved yet. */
async function load(): Promise<unknown> {
  const file = process.env.CONTENT_STORE_FILE;
  if (!file) {
    const value = await withTimeout(
      blobStore(STORE).get(KEY, { type: "json" }),
      "Netlify Blobs content read",
    );
    return value ?? undefined;
  }
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

const isContent = (value: unknown): value is StoredContent =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** For saves: a save replaces everything, so unreadable content must stop it, not look empty. */
export async function readStoredContentOrThrow(): Promise<StoredContent> {
  const value = await load();
  if (value === undefined) return {};
  if (!isContent(value)) throw new Error("Saved content is not an object");
  return value;
}

/**
 * For public pages. On Netlify a failed read throws: a build then fails and the live deploy stays,
 * and a page refresh fails and the last good page stays, instead of either showing the defaults
 * over saved edits. Elsewhere (local builds, CI) pages fall back to src/content/.
 */
export async function readStoredContent(): Promise<StoredContent> {
  try {
    return await readStoredContentOrThrow();
  } catch (error) {
    if (blobsRequired()) throw error;
    console.error("Could not read saved content", error);
    return {};
  }
}

/** Replaces all saved content. Throws on failure, so the admin is never told a failed save worked. */
export async function writeStoredContent(content: StoredContent): Promise<void> {
  const file = process.env.CONTENT_STORE_FILE;
  if (file) await writeFile(file, JSON.stringify(content, null, 2));
  else await withTimeout(blobStore(STORE).setJSON(KEY, content), "Netlify Blobs content save");
}
