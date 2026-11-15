import { getStore } from "@netlify/blobs";

// Shared Netlify Blobs access for saved content and uploaded images.

/** How long one Blobs call may take; well under Netlify's 30-second function limit. */
export const BLOBS_TIMEOUT_MS = 8000;

type WrappedFetch = typeof fetch & { _nextOriginalFetch?: typeof fetch };

/** Host and path only: signed Blobs URLs carry credentials in the query string. */
const describeUrl = (input: Parameters<typeof fetch>[0]) => {
  try {
    const url = new URL(input instanceof Request ? input.url : String(input));
    return `${url.host}${url.pathname}`;
  } catch {
    return "an unreadable URL";
  }
};

/** The error's message plus its cause, where the real network reason usually is. */
const describeError = (error: unknown) => {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause as { code?: string; message?: string } | undefined;
  const reason = cause?.code ?? cause?.message;
  return reason ? `${error.message} (${reason})` : error.message;
};

/**
 * The same response with its body read into memory. Next's fetch can hand back a clone, and
 * cancelling a cloned body waits for the other copy, which nobody reads; @netlify/blobs cancels the
 * body of every 404, so reading a key that was never saved hung. Blobs bodies are small.
 */
async function withOwnBody(response: Response): Promise<Response> {
  const init = {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
  if (response.body === null) return new Response(null, init);
  return new Response(await response.arrayBuffer(), init);
}

// Next.js wraps the global fetch to cache responses, and on Netlify that cache is kept in Blobs as
// well, so a Blobs read can end up waiting on itself. Blobs calls use the fetch Next wrapped, when
// it is there, and never cache.
// @netlify/blobs retries failed requests with 5-second pauses and never says why, so a failing
// store looks like a hang; every failed attempt is logged here.
const uncachedFetch: typeof fetch = async (input, init) => {
  const global = globalThis.fetch as WrappedFetch;
  try {
    const response = await (global._nextOriginalFetch ?? global)(input, {
      ...init,
      cache: "no-store",
    });
    // 404 just means nothing is saved under that key yet.
    if (response.status >= 400 && response.status !== 404) {
      console.error(`Netlify Blobs request to ${describeUrl(input)} returned ${response.status}`);
    }
    return await withOwnBody(response);
  } catch (error) {
    console.error(`Netlify Blobs request to ${describeUrl(input)} failed: ${describeError(error)}`);
    throw error;
  }
};

const hostOf = (url: unknown) => {
  try {
    return typeof url === "string" ? new URL(url).host : "none";
  } catch {
    return "invalid";
  }
};

/** The credentials Netlify gives its functions. Its build has none. */
const blobsContext = () =>
  (globalThis as { netlifyBlobsContext?: string }).netlifyBlobsContext ||
  process.env.NETLIFY_BLOBS_CONTEXT;

/** A site ID and access token, for reading Blobs where Netlify gives no context. */
const tokenCredentials = () => {
  const siteID = process.env.SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : undefined;
};

/**
 * True on Netlify (its build or its functions) or wherever a token is set. Saved content must be
 * read there: a failed read is an error, not "nothing saved".
 */
export const blobsRequired = () =>
  Boolean(blobsContext() || process.env.NETLIFY === "true" || tokenCredentials());

/** Where Blobs calls go, for the logs: hosts and which values are set, never the token itself. */
export function blobsDiagnostics(): string {
  const raw = blobsContext();
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
// Netlify's build has no Blobs context, so it reads with SITE_ID (set by Netlify) and BLOBS_TOKEN;
// without them every deploy prerendered the defaults over saved edits. Inside functions the token
// is left out: passing one replaces Netlify's own context, which reads through the faster edge.
export const blobStore = (name: string) => {
  const credentials = blobsContext() ? undefined : tokenCredentials();
  if (!blobsContext() && !credentials && process.env.NETLIFY === "true") {
    throw new Error(
      "Netlify Blobs can't be read in this build: set BLOBS_TOKEN (a Netlify personal access token) in the site's environment variables",
    );
  }
  return getStore({ name, consistency: "strong", fetch: uncachedFetch, ...credentials });
};

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
