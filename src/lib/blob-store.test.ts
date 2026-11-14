// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { BLOBS_TIMEOUT_MS, blobsDiagnostics, blobStore, withTimeout } from "./blob-store";

const blobs = vi.hoisted(() => ({ getStore: vi.fn() }));
vi.mock("@netlify/blobs", () => ({ getStore: blobs.getStore }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
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
    const response = new Response("denied", { status: 403 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    blobStore("site-content");
    const { fetch } = blobs.getStore.mock.calls[0][0];

    await expect(fetch("https://blobs.example/site/content?signature=secret")).resolves.toBe(
      response,
    );
    const text = log.mock.calls.flat().join(" ");
    expect(text).toContain("403");
    expect(text).toContain("blobs.example/site/content");
    expect(text).not.toContain("secret");
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
