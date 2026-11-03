// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

import { readStoredContent, readStoredContentOrThrow, writeStoredContent } from "./content-store";

const blobs = vi.hoisted(() => ({
  getStore: vi.fn(),
  get: vi.fn(),
  setJSON: vi.fn(),
}));
vi.mock("@netlify/blobs", () => ({ getStore: blobs.getStore }));

const SAVED = { business: { phone: "+91 90000 00000" } };

let logged: MockInstance<typeof console.error>;

beforeEach(() => {
  logged = vi.spyOn(console, "error").mockImplementation(() => {});
  blobs.getStore.mockReturnValue({ get: blobs.get, setJSON: blobs.setJSON });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("with CONTENT_STORE_FILE set (local development and tests)", () => {
  let dir: string;
  let file: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "content-store-"));
    file = join(dir, "content.json");
    vi.stubEnv("CONTENT_STORE_FILE", file);
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("reads nothing, without an error, before anything is saved", async () => {
    await expect(readStoredContent()).resolves.toEqual({});
    expect(logged).not.toHaveBeenCalled();
  });

  it("reads back what was saved, without touching Netlify Blobs", async () => {
    await writeStoredContent(SAVED);
    await expect(readStoredContent()).resolves.toEqual(SAVED);
    expect(blobs.getStore).not.toHaveBeenCalled();
  });

  it("replaces the previous content on each save", async () => {
    await writeStoredContent(SAVED);
    await writeStoredContent({ other: true });
    await expect(readStoredContent()).resolves.toEqual({ other: true });
  });

  it.each(["not json", "[]", '"text"', "null"])(
    "logs and reads nothing when the file holds %s",
    async (contents) => {
      writeFileSync(file, contents);
      await expect(readStoredContent()).resolves.toEqual({});
      expect(logged).toHaveBeenCalled();
    },
  );

  // Saves start from this read: treating bad data as "nothing saved" would wipe other sections.
  it.each(["not json", "[]", '"text"', "null"])(
    "the strict read fails when the file holds %s",
    async (contents) => {
      writeFileSync(file, contents);
      await expect(readStoredContentOrThrow()).rejects.toThrow();
    },
  );

  it("the strict read returns the content, or nothing before the first save", async () => {
    await expect(readStoredContentOrThrow()).resolves.toEqual({});
    await writeStoredContent(SAVED);
    await expect(readStoredContentOrThrow()).resolves.toEqual(SAVED);
  });

  it("fails a save that could not be written", async () => {
    writeFileSync(file, "{}");
    vi.stubEnv("CONTENT_STORE_FILE", join(file, "not-a-directory.json"));
    await expect(writeStoredContent(SAVED)).rejects.toThrow();
  });
});

describe("without CONTENT_STORE_FILE (Netlify Blobs)", () => {
  beforeEach(() => {
    vi.stubEnv("CONTENT_STORE_FILE", "");
  });

  // Edge reads can lag by up to 60 seconds, so a page rebuilt after a save could show the old value.
  it("reads with strong consistency so a save is seen straight away", async () => {
    blobs.get.mockResolvedValue(SAVED);
    await expect(readStoredContent()).resolves.toEqual(SAVED);
    expect(blobs.getStore).toHaveBeenCalledWith({ name: "site-content", consistency: "strong" });
    expect(blobs.get).toHaveBeenCalledWith("content", { type: "json" });
  });

  it("reads nothing, without an error, before anything is saved", async () => {
    blobs.get.mockResolvedValue(null);
    await expect(readStoredContent()).resolves.toEqual({});
    expect(logged).not.toHaveBeenCalled();
  });

  it("logs and reads nothing when the stored value is not an object", async () => {
    blobs.get.mockResolvedValue(["unexpected"]);
    await expect(readStoredContent()).resolves.toEqual({});
    expect(logged).toHaveBeenCalled();
  });

  it("logs and reads nothing when Blobs fails, so public pages still render", async () => {
    blobs.get.mockRejectedValue(new Error("Blobs is down"));
    await expect(readStoredContent()).resolves.toEqual({});
    expect(logged).toHaveBeenCalled();
  });

  it("logs and reads nothing when Blobs is not configured", async () => {
    blobs.getStore.mockImplementation(() => {
      throw new Error("The environment has not been configured to use Netlify Blobs");
    });
    await expect(readStoredContent()).resolves.toEqual({});
    expect(logged).toHaveBeenCalled();
  });

  it("the strict read fails when Blobs fails or holds the wrong shape", async () => {
    blobs.get.mockRejectedValueOnce(new Error("Blobs is down"));
    await expect(readStoredContentOrThrow()).rejects.toThrow("Blobs is down");

    blobs.get.mockResolvedValueOnce(["unexpected"]);
    await expect(readStoredContentOrThrow()).rejects.toThrow();
  });

  it("the strict read returns nothing before the first save", async () => {
    blobs.get.mockResolvedValue(null);
    await expect(readStoredContentOrThrow()).resolves.toEqual({});
  });

  it("saves the whole content as JSON", async () => {
    blobs.setJSON.mockResolvedValue({ modified: true });
    await writeStoredContent(SAVED);
    expect(blobs.getStore).toHaveBeenCalledWith({ name: "site-content", consistency: "strong" });
    expect(blobs.setJSON).toHaveBeenCalledWith("content", SAVED);
  });

  it("fails a save that Blobs rejected, so the admin is never told it worked", async () => {
    blobs.setJSON.mockRejectedValue(new Error("Blobs is down"));
    await expect(writeStoredContent(SAVED)).rejects.toThrow("Blobs is down");
  });

  it("fails a save when Blobs is not configured", async () => {
    blobs.getStore.mockImplementation(() => {
      throw new Error("The environment has not been configured to use Netlify Blobs");
    });
    await expect(writeStoredContent(SAVED)).rejects.toThrow("not been configured");
  });
});
