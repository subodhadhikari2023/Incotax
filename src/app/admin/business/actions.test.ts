// @vitest-environment node
import { revalidatePath } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow, writeStoredContent } from "@/lib/content-store";

import { saveBusinessDetails } from "./actions";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/content-store", () => ({
  readStoredContentOrThrow: vi.fn(),
  writeStoredContent: vi.fn(),
}));

function form(values: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue(undefined);
  vi.mocked(readStoredContentOrThrow).mockResolvedValue({});
  vi.mocked(writeStoredContent).mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("saveBusinessDetails", () => {
  it("does nothing unless an admin is logged in", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("redirect:/admin/login"));
    await expect(saveBusinessDetails(undefined, form({ phone: "9000000000" }))).rejects.toThrow(
      "redirect:/admin/login",
    );
    expect(readStoredContentOrThrow).not.toHaveBeenCalled();
    expect(writeStoredContent).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("saves the details and refreshes every page, keeping other saved sections", async () => {
    vi.mocked(readStoredContentOrThrow).mockResolvedValue({ home: { keep: "me" } });

    const state = await saveBusinessDetails(
      undefined,
      form({ phone: " 9000000000 ", whatsappNumber: "+91 90000 00000", email: "a@example.test" }),
    );

    expect(writeStoredContent).toHaveBeenCalledWith({
      home: { keep: "me" },
      business: { phone: "9000000000", whatsappNumber: "919000000000", email: "a@example.test" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(state).toMatchObject({ saved: true, errors: {} });
    expect(state?.values.whatsappNumber).toBe("919000000000");
  });

  it("removes a field that was cleared, so the page shows its default again", async () => {
    vi.mocked(readStoredContentOrThrow).mockResolvedValue({
      business: { phone: "9000000000", email: "a@example.test" },
    });
    await saveBusinessDetails(undefined, form({ email: "a@example.test" }));
    expect(writeStoredContent).toHaveBeenCalledWith({ business: { email: "a@example.test" } });
  });

  it("returns the errors and what was typed, without saving, when a field is invalid", async () => {
    const state = await saveBusinessDetails(undefined, form({ email: "not-an-email", hours: "9" }));

    expect(state?.saved).toBeFalsy();
    expect(state?.errors.email).toEqual(expect.any(String));
    expect(state?.values).toMatchObject({ email: "not-an-email", hours: "9" });
    expect(writeStoredContent).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  // Saving replaces the whole file, so saving after a failed read could wipe other sections.
  it("does not save when the existing content could not be read", async () => {
    vi.mocked(readStoredContentOrThrow).mockRejectedValue(new Error("Blobs is down"));
    const state = await saveBusinessDetails(undefined, form({ phone: "9000000000" }));

    expect(state?.saved).toBeFalsy();
    expect(state?.error).toEqual(expect.any(String));
    expect(state?.values.phone).toBe("9000000000");
    expect(writeStoredContent).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("reports a failed save instead of saying it worked", async () => {
    vi.mocked(writeStoredContent).mockRejectedValue(new Error("Blobs is down"));
    const state = await saveBusinessDetails(undefined, form({ phone: "9000000000" }));

    expect(state?.saved).toBeFalsy();
    expect(state?.error).toEqual(expect.any(String));
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
