// @vitest-environment node
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow, writeStoredContent } from "@/lib/content-store";
import { catalogEntry } from "@/lib/service-catalog";

import {
  createService,
  deleteServiceDraft,
  hideServiceAction,
  publishServiceAction,
  restoreServiceAction,
  toggleHomeServiceAction,
} from "./catalog-actions";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/admin/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/content-store", () => ({
  readStoredContentOrThrow: vi.fn(),
  writeStoredContent: vi.fn(),
}));

const draft = {
  serviceCatalog: {
    added: [{ slug: "new-idea", name: "New Idea", category: "registration", published: false }],
  },
};

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};
const written = () => vi.mocked(writeStoredContent).mock.calls[0][0];

beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue(undefined);
  vi.mocked(readStoredContentOrThrow).mockResolvedValue({ ...draft, business: { phone: "1" } });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

const guarded: [string, () => Promise<unknown>][] = [
  ["createService", () => createService(undefined, form({ name: "A", category: "registration" }))],
  ["publishServiceAction", () => publishServiceAction("new-idea")],
  ["hideServiceAction", () => hideServiceAction("gst-registration")],
  ["restoreServiceAction", () => restoreServiceAction("gst-registration")],
  ["deleteServiceDraft", () => deleteServiceDraft("new-idea")],
  ["toggleHomeServiceAction", () => toggleHomeServiceAction("gst-registration")],
];

describe.each(guarded)("%s", (_name, run) => {
  it("does nothing unless an admin is logged in", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("redirect:/admin/login"));
    await expect(run()).rejects.toThrow("redirect:/admin/login");
    expect(writeStoredContent).not.toHaveBeenCalled();
  });

  it("does not save over content it could not read", async () => {
    vi.mocked(readStoredContentOrThrow).mockRejectedValue(new Error("Blobs is down"));
    await run().catch(() => {});
    expect(writeStoredContent).not.toHaveBeenCalled();
  });
});

describe("createService", () => {
  it("saves a draft, refreshes the pages and opens its editor", async () => {
    await createService(undefined, form({ name: " Tax Audit ", category: "compliance-taxation" }));

    expect(catalogEntry(written(), "tax-audit")).toMatchObject({
      name: "Tax Audit",
      status: "draft",
    });
    expect(written().business).toEqual({ phone: "1" });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(redirect).toHaveBeenCalledWith("/admin/services/tax-audit");
  });

  it.each([
    [{ name: "", category: "registration" }, "name"],
    [{ name: "x".repeat(151), category: "registration" }, "name"],
    [{ name: "New Idea", category: "registration" }, "name"],
    [{ name: "gst registration", category: "registration" }, "name"],
    [{ name: "Fine", category: "made-up" }, "category"],
  ])("refuses %j, saying what is wrong", async (values, field) => {
    const state = await createService(undefined, form(values));
    expect(state?.errors[field]).toEqual(expect.any(String));
    expect(writeStoredContent).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("changing a service's state", () => {
  it("publishes a draft", async () => {
    await publishServiceAction("new-idea");
    expect(catalogEntry(written(), "new-idea")?.status).toBe("published");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("hides and restores", async () => {
    await hideServiceAction("gst-registration");
    expect(catalogEntry(written(), "gst-registration")?.status).toBe("hidden");
  });

  it("deletes a draft, but never a published service", async () => {
    await deleteServiceDraft("new-idea");
    expect(catalogEntry(written(), "new-idea")).toBeUndefined();

    vi.mocked(writeStoredContent).mockClear();
    await expect(deleteServiceDraft("gst-registration")).rejects.toThrow();
    expect(writeStoredContent).not.toHaveBeenCalled();
  });

  it.each(["no-such-service"])("refuses a service that does not exist: %s", async (slug) => {
    await expect(publishServiceAction(slug)).rejects.toThrow();
    await expect(hideServiceAction(slug)).rejects.toThrow();
    await expect(restoreServiceAction(slug)).rejects.toThrow();
    await expect(toggleHomeServiceAction(slug)).rejects.toThrow();
    expect(writeStoredContent).not.toHaveBeenCalled();
  });
});
