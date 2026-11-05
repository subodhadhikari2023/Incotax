// @vitest-environment node
import { revalidatePath } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow, writeStoredContent } from "@/lib/content-store";

import { saveContactContent } from "./contact/actions";
import { saveLegalContent } from "./legal/actions";
import { saveServiceCopy } from "./services/actions";
import { saveSiteCopy } from "./site/actions";
import { saveWhyIncotaxContent } from "./why-incotax/actions";

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

const gst = (previous: undefined, data: FormData) =>
  saveServiceCopy("gst-registration", previous, data);
const privacy = (previous: undefined, data: FormData) =>
  saveLegalContent("privacy-policy", previous, data);

beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue(undefined);
  vi.mocked(readStoredContentOrThrow).mockResolvedValue({ business: { phone: "9000000000" } });
  vi.mocked(writeStoredContent).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

// Every section saves the same way, so each only has to show it is guarded and uses its own key.
describe.each([
  ["site", saveSiteCopy, "site", { popupHeading: "Tell us" }],
  ["why-incotax", saveWhyIncotaxContent, "whyIncotax", { title: "Why us" }],
  ["contact", saveContactContent, "contact", { title: "Reach us" }],
  ["services", gst, "services/gst-registration", { shortDescription: "Short" }],
  ["legal", privacy, "legal/privacy-policy", { lastUpdated: "1 November 2026" }],
] as const)("the %s section's save action", (_name, action, key, values) => {
  it("does nothing unless an admin is logged in", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("redirect:/admin/login"));
    await expect(action(undefined, form(values))).rejects.toThrow("redirect:/admin/login");
    expect(readStoredContentOrThrow).not.toHaveBeenCalled();
    expect(writeStoredContent).not.toHaveBeenCalled();
  });

  it("saves under its own key, keeping the other sections, and refreshes every page", async () => {
    const state = await action(undefined, form(values));

    expect(writeStoredContent).toHaveBeenCalledWith({
      business: { phone: "9000000000" },
      [key]: expect.objectContaining(values),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(state).toMatchObject({ saved: true });
  });
});

describe("save actions for one page of many", () => {
  it("refuses a service that does not exist", async () => {
    await expect(saveServiceCopy("no-such-service", undefined, form())).rejects.toThrow();
    expect(writeStoredContent).not.toHaveBeenCalled();
  });

  it("refuses a legal page that does not exist", async () => {
    await expect(saveLegalContent("no-such-page", undefined, form())).rejects.toThrow();
    expect(writeStoredContent).not.toHaveBeenCalled();
  });
});
