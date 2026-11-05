// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { deleteMedia, readMedia, writeMedia } from "./media-store";

const bytes = Uint8Array.from([1, 2, 3]);
const blobs = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("@netlify/blobs", () => ({ getStore: () => blobs }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("on this machine", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "media-"));
    vi.stubEnv("MEDIA_STORE_DIR", join(dir, "not-yet-created"));
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(dir, { recursive: true, force: true });
  });

  it("keeps what is written, in a folder it creates", async () => {
    await writeMedia("founder-0", bytes);
    expect(Array.from((await readMedia("founder-0"))!)).toEqual([1, 2, 3]);
    expect(blobs.set).not.toHaveBeenCalled();
  });

  it("has nothing for a name never written", async () => {
    expect(await readMedia("founder-1")).toBeNull();
  });

  it("forgets what is deleted, and deleting twice is fine", async () => {
    await writeMedia("founder-0", bytes);
    await deleteMedia("founder-0");
    await deleteMedia("founder-0");
    expect(await readMedia("founder-0")).toBeNull();
  });

  it("refuses a name that could reach outside the folder", async () => {
    await expect(writeMedia("../secret", bytes)).rejects.toThrow();
    await expect(readMedia("../secret")).rejects.toThrow();
    await expect(deleteMedia("a/b")).rejects.toThrow();
  });
});

describe("on the live site", () => {
  beforeEach(() => {
    vi.stubEnv("MEDIA_STORE_DIR", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses Netlify Blobs", async () => {
    blobs.get.mockResolvedValue(bytes.buffer);
    await writeMedia("founder-0", bytes);
    expect(blobs.set).toHaveBeenCalledWith("founder-0", expect.anything());
    expect(Array.from((await readMedia("founder-0"))!)).toEqual([1, 2, 3]);
    await deleteMedia("founder-0");
    expect(blobs.delete).toHaveBeenCalledWith("founder-0");
  });

  it("has nothing for a name never written", async () => {
    blobs.get.mockResolvedValue(null);
    expect(await readMedia("founder-0")).toBeNull();
  });
});
