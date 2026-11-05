import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getStore } from "@netlify/blobs";

// Uploaded images, kept apart from the content JSON. Netlify Blobs on the live site, or a local
// folder when MEDIA_STORE_DIR is set (dev and tests). Saved content records which images exist.
const blobStore = () => getStore({ name: "site-media", consistency: "strong" });

/** Names become file paths locally, so nothing here may reach outside the folder. */
function safeName(name: string) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Unsafe media name: ${name}`);
  return name;
}

export async function writeMedia(name: string, bytes: Uint8Array): Promise<void> {
  safeName(name);
  const dir = process.env.MEDIA_STORE_DIR;
  if (!dir) {
    await blobStore().set(name, new Blob([bytes.slice()]));
    return;
  }
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), bytes);
}

/** The image's bytes, or null if there is none. */
export async function readMedia(name: string): Promise<Uint8Array | null> {
  safeName(name);
  const dir = process.env.MEDIA_STORE_DIR;
  if (!dir) {
    const data = await blobStore().get(name, { type: "arrayBuffer" });
    return data ? new Uint8Array(data) : null;
  }
  try {
    return new Uint8Array(await readFile(join(dir, name)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function deleteMedia(name: string): Promise<void> {
  safeName(name);
  const dir = process.env.MEDIA_STORE_DIR;
  if (dir) await rm(join(dir, name), { force: true });
  else await blobStore().delete(name);
}
