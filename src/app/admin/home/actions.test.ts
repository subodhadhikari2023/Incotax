// @vitest-environment node
import { revalidatePath } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow, writeStoredContent } from "@/lib/content-store";

import { saveHomeContent } from "./actions";

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

const noLists = { stats: [], clients: [], steps: [], highlights: [], reviews: [] };

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

describe("saveHomeContent", () => {
  it("does nothing unless an admin is logged in", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("redirect:/admin/login"));
    await expect(saveHomeContent(undefined, form({ headline: "New" }))).rejects.toThrow(
      "redirect:/admin/login",
    );
    expect(readStoredContentOrThrow).not.toHaveBeenCalled();
    expect(writeStoredContent).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("saves the content and refreshes every page, keeping other saved sections", async () => {
    vi.mocked(readStoredContentOrThrow).mockResolvedValue({ business: { phone: "9000000000" } });

    const state = await saveHomeContent(
      undefined,
      form({
        headline: " Build It Right ",
        "stats.0.value": "5+",
        "stats.0.label": "Years",
        "clients.0.name": "Acme Traders",
      }),
    );

    expect(writeStoredContent).toHaveBeenCalledWith({
      business: { phone: "9000000000" },
      home: {
        ...noLists,
        headline: "Build It Right",
        stats: [{ value: "5+", label: "Years" }],
        clients: [{ name: "Acme Traders" }],
      },
    });
    // The stats also show on Why IncoTax, so every page must rebuild, not only the home page.
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(state).toMatchObject({ saved: true, errors: {} });
    expect(state?.values.headline).toBe("Build It Right");
  });

  it("removes cleared text, so the page shows its default again", async () => {
    vi.mocked(readStoredContentOrThrow).mockResolvedValue({
      home: { headline: "Old", heroLabel: "Old label" },
    });
    await saveHomeContent(undefined, form({ headline: "Kept" }));
    expect(writeStoredContent).toHaveBeenCalledWith({
      home: { ...noLists, headline: "Kept" },
    });
  });

  it("saves an emptied list as empty, so its section is hidden", async () => {
    vi.mocked(readStoredContentOrThrow).mockResolvedValue({
      home: { clients: [{ name: "Old client" }] },
    });
    await saveHomeContent(undefined, form());
    expect(writeStoredContent).toHaveBeenCalledWith({ home: noLists });
  });

  it("returns the errors and what was typed, without saving, when a field is invalid", async () => {
    const state = await saveHomeContent(
      undefined,
      form({ headline: "Build It Right", goldPhrase: "Elsewhere", "steps.0.title": "Only title" }),
    );

    expect(state?.saved).toBeFalsy();
    expect(state?.errors.goldPhrase).toEqual(expect.any(String));
    expect(state?.errors["steps.0.text"]).toEqual(expect.any(String));
    expect(state?.values).toMatchObject({
      goldPhrase: "Elsewhere",
      steps: [{ title: "Only title", text: "" }],
    });
    expect(writeStoredContent).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  // Saving replaces the whole file, so saving after a failed read could wipe other sections.
  it("does not save when the existing content could not be read", async () => {
    vi.mocked(readStoredContentOrThrow).mockRejectedValue(new Error("Blobs is down"));
    const state = await saveHomeContent(undefined, form({ headline: "New" }));

    expect(state?.saved).toBeFalsy();
    expect(state?.error).toEqual(expect.any(String));
    expect(state?.values.headline).toBe("New");
    expect(writeStoredContent).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("reports a failed save instead of saying it worked", async () => {
    vi.mocked(writeStoredContent).mockRejectedValue(new Error("Blobs is down"));
    const state = await saveHomeContent(undefined, form({ headline: "New" }));

    expect(state?.saved).toBeFalsy();
    expect(state?.error).toEqual(expect.any(String));
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
