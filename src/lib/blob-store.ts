import { getStore } from "@netlify/blobs";

// Shared Netlify Blobs access for saved content and uploaded images.

/** How long one Blobs call may take; well under Netlify's 30-second function limit. */
export const BLOBS_TIMEOUT_MS = 8000;

type WrappedFetch = typeof fetch & { _nextOriginalFetch?: typeof fetch };

// Next.js wraps the global fetch to cache responses, and on Netlify that cache is kept in Blobs as
// well, so a Blobs read can end up waiting on itself. Blobs calls use the fetch Next wrapped, when
// it is there, and never cache.
const uncachedFetch: typeof fetch = (input, init) => {
  const global = globalThis.fetch as WrappedFetch;
  return (global._nextOriginalFetch ?? global)(input, { ...init, cache: "no-store" });
};

const hostOf = (url: unknown) => {
  try {
    return typeof url === "string" ? new URL(url).host : "none";
  } catch {
    return "invalid";
  }
};

/** Where Blobs calls go, for the logs: hosts and which values are set, never the token itself. */
export function blobsDiagnostics(): string {
  const raw =
    (globalThis as { netlifyBlobsContext?: string }).netlifyBlobsContext ??
    process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw) return "no Blobs context in the environment";
  try {
    const context = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    return [
      `edge: ${hostOf(context.edgeURL)}`,
      `uncached edge: ${hostOf(context.uncachedEdgeURL)}`,
      `api: ${hostOf(context.apiURL)}`,
      `site: ${context.siteID ? "yes" : "no"}`,
      `token: ${context.token ? "yes" : "no"}`,
    ].join(", ");
  } catch {
    return "Blobs context could not be read";
  }
}

// Strong consistency: edge reads can lag by up to 60 seconds, so a page rebuilt right after a save
// could otherwise show the old value.
export const blobStore = (name: string) =>
  getStore({ name, consistency: "strong", fetch: uncachedFetch });

/** Rejects if `promise` hasn't settled in time, naming what timed out. */
export function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(`${label} timed out after ${BLOBS_TIMEOUT_MS} ms (${blobsDiagnostics()})`),
        ),
      BLOBS_TIMEOUT_MS,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
