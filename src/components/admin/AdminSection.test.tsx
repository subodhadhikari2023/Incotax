import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminSection } from "./AdminSection";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/services" }));
vi.mock("@/app/admin/actions", () => ({ logout: vi.fn() }));

const page = (
  <AdminSection title="Service pages" intro="Choose a service.">
    <p>The list</p>
  </AdminSection>
);

describe("AdminSection", () => {
  it("shows the way back, ending at this page", () => {
    render(page);
    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumb).getByRole("link", { name: "Admin panel" })).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(within(breadcrumb).getByText("Service pages")).toHaveAttribute("aria-current", "page");
  });

  it("names the list and shows it", () => {
    render(page);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Service pages");
    expect(within(screen.getByRole("main")).getByText("The list")).toBeInTheDocument();
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
