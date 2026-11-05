// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { readMedia } from "@/lib/media-store";

import { GET } from "./route";

vi.mock("@/lib/media-store", () => ({ readMedia: vi.fn() }));

const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const get = (name: string, search = "") =>
  GET(new Request(`http://localhost/media/${name}${search}`), {
    params: Promise.resolve({ name }),
  });

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("GET /media/[name]", () => {
  it("serves a photo with its real type, cached because its address changes on replace", async () => {
    vi.mocked(readMedia).mockResolvedValue(png);
    const response = await get("founder-0", "?v=abc");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual(Array.from(png));
  });

  it("does not let browsers keep the address with no version, which can change", async () => {
    vi.mocked(readMedia).mockResolvedValue(png);
    expect((await get("founder-0")).headers.get("cache-control")).toBe("no-cache");
  });

  it("is a 404 when there is no photo", async () => {
    vi.mocked(readMedia).mockResolvedValue(null);
    expect((await get("founder-0")).status).toBe(404);
  });

  it.each(["founder-9", "secret", "..%2Fsecret", "founder-0.svg"])(
    "only serves known names, not %s",
    async (name) => {
      expect((await get(name)).status).toBe(404);
      expect(readMedia).not.toHaveBeenCalled();
    },
  );

  it("is a 404 rather than a crash when the store is unavailable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(readMedia).mockRejectedValue(new Error("Blobs is down"));
    expect((await get("founder-0")).status).toBe(404);
  });
});
