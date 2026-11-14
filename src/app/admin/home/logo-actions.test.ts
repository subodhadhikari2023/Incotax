// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requireAdmin } from "@/lib/admin/auth";
import { writeMedia } from "@/lib/media-store";

import { uploadClientLogo } from "./logo-actions";

vi.mock("@/lib/admin/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/media-store", () => ({ writeMedia: vi.fn() }));

const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);

function upload(bytes: Uint8Array = png, name = "logo.png") {
  const data = new FormData();
  data.set("logo", new File([bytes.slice()], name));
  return data;
}

beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("uploadClientLogo", () => {
  it("does nothing unless an admin is logged in", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("redirect:/admin/login"));
    await expect(uploadClientLogo(upload())).rejects.toThrow("redirect:/admin/login");
    expect(writeMedia).not.toHaveBeenCalled();
  });

  it("keeps the logo under a new name and returns its address", async () => {
    const result = await uploadClientLogo(upload());

    expect(result).toEqual({
      url: expect.stringMatching(/^\/media\/client-[a-z0-9]+\?v=[a-z0-9]+$/),
    });
    const [name, bytes] = vi.mocked(writeMedia).mock.calls[0];
    expect("url" in result && result.url).toContain(`/media/${name}?v=`);
    expect(Array.from(bytes)).toEqual(Array.from(png));
  });

  it("gives every upload its own name", async () => {
    await uploadClientLogo(upload());
    await uploadClientLogo(upload());
    const [first, second] = vi.mocked(writeMedia).mock.calls.map(([name]) => name);
    expect(first).not.toBe(second);
  });

  it("refuses a file that is not a JPG, PNG or WebP image, whatever its name", async () => {
    const svg = new TextEncoder().encode("<svg onload='alert(1)'/>");
    expect(await uploadClientLogo(upload(svg, "logo.png"))).toEqual({
      error: "Please choose a JPG, PNG or WebP image.",
    });
    expect(writeMedia).not.toHaveBeenCalled();
  });

  it("asks for a file when none is sent", async () => {
    expect(await uploadClientLogo(new FormData())).toEqual({ error: "Please choose an image." });
  });

  it("says so when the image can't be stored", async () => {
    vi.mocked(writeMedia).mockRejectedValue(new Error("Blobs down"));
    expect(await uploadClientLogo(upload())).toEqual({
      error: "Could not upload the logo. Please try again.",
    });
  });
});
