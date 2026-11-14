import { getStore } from "@netlify/blobs";

// Shared Netlify Blobs access for saved content and uploaded images.

/** How long one Blobs call may take; well under Netlify's 30-second function limit. */
export const BLOBS_TIMEOUT_MS = 8000;

// Next.js wraps the global fetch to cache responses, and on Netlify that cache is kept in Blobs as
// well, so a cached Blobs read can end up waiting on itself. Blobs calls skip that cache.
const uncachedFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

// Strong consistency: edge reads can lag by up to 60 seconds, so a page rebuilt right after a save
// could otherwise show the old value.
export const blobStore = (name: string) =>
  getStore({ name, consistency: "strong", fetch: uncachedFetch });

/** Rejects if `promise` hasn't settled in time, naming what timed out. */
export function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${BLOBS_TIMEOUT_MS} ms`)),
      BLOBS_TIMEOUT_MS,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
