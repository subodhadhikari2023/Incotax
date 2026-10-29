import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { EnquiryPopup, POPUP_SEEN_KEY } from "./EnquiryPopup";

describe("EnquiryPopup", () => {
  beforeEach(() => sessionStorage.clear());

  it("opens on first visit with the confirmed heading", async () => {
    render(<EnquiryPopup />);

    const dialog = await screen.findByRole("dialog", { name: "Your Requirement. Our Expertise." });
    expect(dialog).toBeInTheDocument();
  });

  it("closes with the close button and stays closed for the session", async () => {
    const user = userEvent.setup();
    render(<EnquiryPopup />);

    await user.click(await screen.findByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(sessionStorage.getItem(POPUP_SEEN_KEY)).toBe("1");
  });

  it("closes with Escape", async () => {
    const user = userEvent.setup();
    render(<EnquiryPopup />);
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not open again once seen this session", () => {
    sessionStorage.setItem(POPUP_SEEN_KEY, "1");
    render(<EnquiryPopup />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
