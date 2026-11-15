// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { BLOBS_TIMEOUT_MS, blobsDiagnostics, blobStore, withTimeout } from "./blob-store";

const blobs = vi.hoisted(() => ({ getStore: vi.fn() }));
vi.mock("@netlify/blobs", () => ({ getStore: blobs.getStore }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

// Netlify's build has no Blobs context, so pages prerendered there used the defaults and every
// deploy hid what the admin panel had saved. The build reads with the site ID and an access token.
describe("blobStore credentials", () => {
  const credentials = () => {
    const { siteID, token } = blobs.getStore.mock.calls[0][0];
    return { siteID, token };
  };

  it("uses SITE_ID and BLOBS_TOKEN where there is no Blobs context, as in Netlify's build", () => {
    vi.stubEnv("NETLIFY_BLOBS_CONTEXT", "");
    vi.stubEnv("SITE_ID", "site-1");
    vi.stubEnv("BLOBS_TOKEN", "token-1");
    blobStore("site-content");
    expect(credentials()).toEqual({ siteID: "site-1", token: "token-1" });
  });

  // Passing both replaces the function's own context, which reads through the faster edge.
  it("leaves them out inside functions, where Netlify provides its own context", () => {
    vi.stubEnv("NETLIFY_BLOBS_CONTEXT", "e30=");
    vi.stubEnv("SITE_ID", "site-1");
    vi.stubEnv("BLOBS_TOKEN", "token-1");
    blobStore("site-content");
    expect(credentials()).toEqual({ siteID: undefined, token: undefined });
  });

  it("refuses, naming BLOBS_TOKEN, in a Netlify build that doesn't have it", () => {
    vi.stubEnv("NETLIFY", "true");
    vi.stubEnv("NETLIFY_BLOBS_CONTEXT", "");
    vi.stubEnv("BLOBS_TOKEN", "");
    expect(() => blobStore("site-content")).toThrow(/BLOBS_TOKEN/);
    expect(blobs.getStore).not.toHaveBeenCalled();
  });

  it("off Netlify without a token, leaves the missing setup for @netlify/blobs to report", () => {
    vi.stubEnv("NETLIFY", "");
    vi.stubEnv("NETLIFY_BLOBS_CONTEXT", "");
    vi.stubEnv("BLOBS_TOKEN", "");
    blobStore("site-content");
    expect(credentials()).toEqual({ siteID: undefined, token: undefined });
  });
});

describe("blobStore", () => {
  it("opens the named store with strong consistency", () => {
    blobStore("site-content");
    expect(blobs.getStore).toHaveBeenCalledWith(
      expect.objectContaining({ name: "site-content", consistency: "strong" }),
    );
  });

  // Next.js wraps the global fetch to cache responses, and on Netlify that cache lives in Blobs too,
  // so a cached Blobs read can wait on itself. Blobs calls must bypass it.
  it("fetches with caching turned off", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchSpy);
    blobStore("site-content");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    await fetch("https://blobs.example/content", { method: "GET" });
    expect(fetchSpy).toHaveBeenCalledWith("https://blobs.example/content", {
      method: "GET",
      cache: "no-store",
    });
  });
});

describe("blobStore fetch", () => {
  // Next keeps the real fetch on its wrapper; Blobs calls skip the wrapper entirely when it's there.
  it("uses Next's original fetch when Next has wrapped the global one", async () => {
    const original = vi.fn().mockResolvedValue(new Response("{}"));
    const wrapped = Object.assign(vi.fn(), { _nextOriginalFetch: original });
    vi.stubGlobal("fetch", wrapped);
    blobStore("site-media");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    await fetch("https://blobs.example/x");
    expect(original).toHaveBeenCalledWith("https://blobs.example/x", { cache: "no-store" });
    expect(wrapped).not.toHaveBeenCalled();
  });

  // @netlify/blobs retries failed requests with 5-second pauses and never logs why, so a failing
  // store looks like a hang. Each failed attempt is logged here; signed URLs carry credentials in the
  // query string, so only the host and path are written.
  it("logs a failed request's error and cause, then rethrows it", async () => {
    const error = new TypeError("fetch failed", { cause: new Error("getaddrinfo ENOTFOUND") });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    blobStore("site-content");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    await expect(fetch("https://blobs.example/site/content?signature=secret")).rejects.toBe(error);
    const text = log.mock.calls.flat().join(" ");
    expect(text).toContain("blobs.example/site/content");
    expect(text).toContain("fetch failed");
    expect(text).toContain("getaddrinfo ENOTFOUND");
    expect(text).not.toContain("secret");
    log.mockRestore();
  });

  it("logs an error status and still returns the response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("denied", { status: 403 })));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    blobStore("site-content");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    const response: Response = await fetch("https://blobs.example/site/content?signature=secret");
    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toBe("denied");
    const text = log.mock.calls.flat().join(" ");
    expect(text).toContain("403");
    expect(text).toContain("blobs.example/site/content");
    expect(text).not.toContain("secret");
    log.mockRestore();
  });

  // Next's fetch clones responses, and cancelling a cloned body waits until the other copy is read
  // or cancelled too, which never happens. @netlify/blobs cancels the body of every 404, so a read
  // of a key that was never saved hung until the timeout. The body must be one Blobs owns outright.
  it("returns a response whose body can be cancelled even when fetch handed back a clone", async () => {
    const original = new Response("not found", { status: 404 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(original.clone()));
    vi.spyOn(console, "error").mockImplementation(() => {});
    blobStore("site-content");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    const response: Response = await fetch("https://blobs.example/site/content");
    const cancelled = response.body?.cancel().then(() => "cancelled");
    const outcome = await Promise.race([
      cancelled,
      new Promise((resolve) => setTimeout(() => resolve("still pending"), 100)),
    ]);
    expect(outcome).toBe("cancelled");
    expect(response.status).toBe(404);
  });

  it("keeps the status, headers and body of a successful response", async () => {
    const original = new Response('{"a":1}', {
      status: 200,
      headers: { "content-type": "application/json", etag: '"v1"' },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(original.clone()));
    blobStore("site-content");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    const response: Response = await fetch("https://blobs.example/site/content");
    expect(response.status).toBe(200);
    expect(response.headers.get("etag")).toBe('"v1"');
    await expect(response.json()).resolves.toEqual({ a: 1 });
  });

  it("passes on a response that has no body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    blobStore("site-content");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    const response: Response = await fetch("https://blobs.example/site/content", {
      method: "DELETE",
    });
    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });

  // 404 only means nothing is saved under that key yet (no saved content, no uploaded photo).
  it("does not log a 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    blobStore("site-media");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    await fetch("https://blobs.example/site/founder-0");
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("logs nothing for a successful request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    blobStore("site-content");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    await fetch("https://blobs.example/site/content");
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});

describe("blobsDiagnostics", () => {
  it("names the Blobs hosts without revealing the token", () => {
    const context = {
      siteID: "site-123",
      token: "secret-token",
      edgeURL: "https://edge.blobs.example",
      uncachedEdgeURL: "https://uncached.blobs.example",
    };
    vi.stubEnv("NETLIFY_BLOBS_CONTEXT", Buffer.from(JSON.stringify(context)).toString("base64"));

    const text = blobsDiagnostics();
    expect(text).toContain("edge.blobs.example");
    expect(text).toContain("uncached.blobs.example");
    expect(text).toContain("token: yes");
    expect(text).not.toContain("secret-token");
    vi.unstubAllEnvs();
  });

  it("says when there is no Blobs context at all", () => {
    vi.stubEnv("NETLIFY_BLOBS_CONTEXT", "");
    expect(blobsDiagnostics()).toBe("no Blobs context in the environment");
    vi.unstubAllEnvs();
  });
});

describe("withTimeout", () => {
  it("returns the result when it arrives in time", async () => {
    await expect(withTimeout(Promise.resolve("ok"), "read")).resolves.toBe("ok");
  });

  it("fails with a clear message when the call never finishes", async () => {
    vi.useFakeTimers();
    const pending = withTimeout(new Promise(() => {}), "Netlify Blobs read");
    const check = expect(pending).rejects.toThrow(
      `Netlify Blobs read timed out after ${BLOBS_TIMEOUT_MS} ms`,
    );
    await vi.advanceTimersByTimeAsync(BLOBS_TIMEOUT_MS);
    await check;
  });
});
