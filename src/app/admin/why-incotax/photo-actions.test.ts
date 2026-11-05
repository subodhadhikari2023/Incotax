// @vitest-environment node
import { revalidatePath } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow, writeStoredContent } from "@/lib/content-store";
import { deleteMedia, writeMedia } from "@/lib/media-store";

import { saveFounderPhoto } from "./photo-actions";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/content-store", () => ({
  readStoredContentOrThrow: vi.fn(),
  writeStoredContent: vi.fn(),
}));
vi.mock("@/lib/media-store", () => ({ writeMedia: vi.fn(), deleteMedia: vi.fn() }));

const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);

function upload(bytes: Uint8Array = png) {
  const data = new FormData();
  data.set("photo", new File([bytes.slice()], "me.png", { type: "image/png" }));
  return data;
}
function removal() {
  const data = new FormData();
  data.set("removePhoto", "1");
  return data;
}

beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue(undefined);
  vi.mocked(readStoredContentOrThrow).mockResolvedValue({
    business: { phone: "9000000000" },
    founderPhotos: { "1": "old" },
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("saveFounderPhoto", () => {
  it("does nothing unless an admin is logged in", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("redirect:/admin/login"));
    await expect(saveFounderPhoto(0, undefined, upload())).rejects.toThrow("redirect:/admin/login");
    expect(writeMedia).not.toHaveBeenCalled();
  });

  it("refuses a founder that does not exist", async () => {
    await expect(saveFounderPhoto(9, undefined, upload())).rejects.toThrow();
    expect(writeMedia).not.toHaveBeenCalled();
  });

  it("keeps the photo, records a new version and refreshes every page", async () => {
    const state = await saveFounderPhoto(0, undefined, upload());

    expect(writeMedia).toHaveBeenCalledWith("founder-0", expect.any(Uint8Array));
    const content = vi.mocked(writeStoredContent).mock.calls[0][0];
    const version = (content.founderPhotos as Record<string, string>)["0"];
    expect(version).toEqual(expect.any(String));
    expect(content).toMatchObject({
      business: { phone: "9000000000" },
      founderPhotos: { "1": "old" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(state).toEqual({ values: { version }, errors: {}, saved: true });
  });

  it("removes a photo, leaving the other founder's", async () => {
    vi.mocked(readStoredContentOrThrow).mockResolvedValue({
      founderPhotos: { "0": "mine", "1": "old" },
    });
    const state = await saveFounderPhoto(0, undefined, removal());

    expect(deleteMedia).toHaveBeenCalledWith("founder-0");
    expect(writeStoredContent).toHaveBeenCalledWith({ founderPhotos: { "1": "old" } });
    expect(state).toEqual({ values: { version: "" }, errors: {}, saved: true });
  });

  it("refuses a file that isn't an allowed image, saving nothing", async () => {
    const state = await saveFounderPhoto(
      0,
      undefined,
      upload(new TextEncoder().encode("<svg></svg>")),
    );

    expect(state?.errors.photo).toMatch(/JPG, PNG or WebP/);
    expect(writeMedia).not.toHaveBeenCalled();
    expect(writeStoredContent).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("does not touch anything when the existing content can't be read", async () => {
    vi.mocked(readStoredContentOrThrow).mockRejectedValue(new Error("Blobs is down"));
    const state = await saveFounderPhoto(0, undefined, upload());

    expect(state?.error).toEqual(expect.any(String));
    expect(writeMedia).not.toHaveBeenCalled();
    expect(writeStoredContent).not.toHaveBeenCalled();
  });

  it("reports a failed save instead of saying it worked", async () => {
    vi.mocked(writeMedia).mockRejectedValue(new Error("Blobs is down"));
    const state = await saveFounderPhoto(0, undefined, upload());

    expect(state?.saved).toBeFalsy();
    expect(state?.error).toEqual(expect.any(String));
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
