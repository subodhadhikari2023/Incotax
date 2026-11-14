// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { BLOBS_TIMEOUT_MS, blobStore, withTimeout } from "./blob-store";

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
