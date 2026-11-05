import { render, screen, within } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { AdminNav } from "./AdminNav";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

const nav = () => screen.getByRole("navigation", { name: "Admin sections" });

describe("AdminNav", () => {
  it("links to the overview and every section", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(<AdminNav />);
    expect(
      within(nav())
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual([
      "Overview",
      "Home page",
      "Why IncoTax",
      "Contact page",
      "Service pages",
      "Legal pages",
      "Business details",
      "Site-wide text",
    ]);
  });

  it("marks the overview as current on the panel home", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(<AdminNav />);
    expect(within(nav()).getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks only the section being edited, including on the pages under it", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/services/gst-registration");
    render(<AdminNav />);
    const current = within(nav())
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.map((link) => link.textContent)).toEqual(["Service pages"]);
  });
});
