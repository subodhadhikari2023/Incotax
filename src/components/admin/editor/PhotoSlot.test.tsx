import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PageEditor, type EditorSection } from "./PageEditor";
import { PhotoSlot } from "./PhotoSlot";

vi.mock("./PreviewFrame", () => ({
  PreviewFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const png = () =>
  new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "me.png", {
    type: "image/png",
  });

function setup(
  version = "",
  action = vi.fn(async () => ({ values: { version: "new" }, errors: {}, saved: true })),
) {
  render(
    <PageEditor
      title="Why IncoTax"
      publicHref="/why-incotax"
      sections={[
        {
          key: "founderPhoto/0",
          schema: [],
          action: action as unknown as EditorSection["action"],
          initial: { version },
        },
      ]}
    >
      <PhotoSlot section="founderPhoto/0" index={0} name="Zeeshan Khan" />
    </PageEditor>,
  );
  return { action, user: userEvent.setup({ applyAccept: false }) };
}

const input = () => screen.getByLabelText("Upload a photo of Zeeshan Khan");
const save = () => screen.getByRole("button", { name: "Save changes" });

beforeEach(() => {
  vi.stubGlobal(
    "URL",
    Object.assign(URL, { createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PhotoSlot", () => {
  it("offers an upload while there is no photo", () => {
    setup();
    expect(screen.getByText("[Professional photo]")).toBeInTheDocument();
    expect(input()).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });

  it("shows the current photo, with the choice to replace or remove it", () => {
    setup("v1");
    expect(screen.getByRole("img", { name: "Zeeshan Khan" }).getAttribute("src")).toContain(
      "founder-0",
    );
    expect(screen.getByText("Replace photo")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove photo of Zeeshan Khan" }),
    ).toBeInTheDocument();
  });

  it("previews a chosen photo on the page, without saving it", async () => {
    const { action, user } = setup();
    await user.upload(input(), png());

    expect(screen.getByRole("img", { name: "Zeeshan Khan" })).toHaveAttribute(
      "src",
      "blob:preview",
    );
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("sends the chosen photo with the save, then has nothing unsaved", async () => {
    const { action, user } = setup();
    await user.upload(input(), png());
    await user.click(save());

    await screen.findByRole("status");
    const data = (action.mock.calls[0] as unknown[])[1] as FormData;
    expect(data.get("photo")).toBeInstanceOf(File);
    expect(screen.getByText("No unsaved changes")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Zeeshan Khan" }).getAttribute("src")).toContain("new");
  });

  it("removes a photo only once saved", async () => {
    const { action, user } = setup(
      "v1",
      vi.fn(async () => ({ values: { version: "" }, errors: {}, saved: true })),
    );
    await user.click(screen.getByRole("button", { name: "Remove photo of Zeeshan Khan" }));

    expect(screen.getByText("[Professional photo]")).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();

    await user.click(save());
    await screen.findByRole("status");
    const data = (action.mock.calls[0] as unknown[])[1] as FormData;
    expect(data.get("removePhoto")).toBe("1");
  });

  it("says at once when a file can't be used, keeping nothing", async () => {
    const { user } = setup();
    await user.upload(input(), new File(["<svg></svg>"], "logo.svg", { type: "image/svg+xml" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/JPG, PNG or WebP/);
    expect(screen.getByText("No unsaved changes")).toBeInTheDocument();
  });

  it("shows a refusal from the server on the slot", async () => {
    const { user } = setup(
      "",
      vi.fn(async () => ({
        values: { version: "" },
        errors: { photo: "Please choose a JPG, PNG or WebP image." },
      })) as never,
    );
    await user.upload(input(), png());
    await user.click(save());

    await waitFor(() =>
      expect(
        screen
          .getAllByRole("alert")
          .map((a) => a.textContent)
          .join(),
      ).toMatch(/JPG, PNG/),
    );
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });
});
