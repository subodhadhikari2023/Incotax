import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminSection } from "./AdminSection";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/services/gst-registration" }));
vi.mock("@/app/admin/actions", () => ({ logout: vi.fn() }));

const page = (
  <AdminSection
    title="GST Registration"
    intro="A field left blank keeps showing its default."
    parent={{ label: "Service pages", href: "/admin/services" }}
    publicHref="/services/gst-registration"
  >
    <p>The form</p>
  </AdminSection>
);

describe("AdminSection", () => {
  it("shows the way back through the panel, ending at this page", () => {
    render(page);
    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(
      within(breadcrumb)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Admin panel", "/admin"],
      ["Service pages", "/admin/services"],
    ]);
    expect(within(breadcrumb).getByText("GST Registration")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("names what is being edited and opens the live page in a new tab", () => {
    render(page);
    expect(screen.getByText("You are editing")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("GST Registration");
    const view = screen.getByRole("link", { name: "View this page on the live site" });
    expect(view).toHaveAttribute("href", "/services/gst-registration");
    expect(view).toHaveAttribute("target", "_blank");
  });

  it("warns that saving changes the live site, and shows the form", () => {
    render(page);
    expect(screen.getByText(/saving updates the live site/i)).toBeInTheDocument();
    expect(within(screen.getByRole("main")).getByText("The form")).toBeInTheDocument();
  });

  it("leaves out the page link when no single page shows this content", () => {
    render(
      <AdminSection title="Site-wide text" intro="Used on many pages.">
        <p>The form</p>
      </AdminSection>,
    );
    expect(
      screen.queryByRole("link", { name: "View this page on the live site" }),
    ).not.toBeInTheDocument();
  });

  it("always offers the section menu, the whole site and logging out", () => {
    render(page);
    expect(screen.getByRole("navigation", { name: "Admin sections" })).toBeInTheDocument();
    const site = screen.getByRole("link", { name: "View site" });
    expect(site).toHaveAttribute("href", "/");
    expect(site).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });
});
