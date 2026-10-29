import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "./Header";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

const mainNav = () => screen.getByRole("navigation", { name: "Main" });

describe("Header", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("shows the brand name and tagline, linking home", () => {
    render(<Header />);
    const home = screen.getByRole("link", { name: /IncoTax Legal Services/ });

    expect(home).toHaveAttribute("href", "/");
    expect(within(home).getByText("Your Trust, Our Commitment!")).toBeInTheDocument();
  });

  it("has the main navigation in the decided order", () => {
    render(<Header />);
    const items = within(mainNav())
      .getAllByRole("listitem")
      .map((item) => item.firstElementChild?.textContent);

    expect(items).toEqual(["Home", "Services", "Why IncoTax", "Contact Us"]);
  });

  it("marks the current page as active", () => {
    pathname.current = "/why-incotax";
    render(<Header />);

    expect(within(mainNav()).getByRole("link", { name: "Why IncoTax" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(mainNav()).getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Services as active on a service page", () => {
    pathname.current = "/services/gst-registration";
    render(<Header />);

    expect(within(mainNav()).getByRole("button", { name: "Services" })).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  it("opens the Services dropdown with services grouped by category", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const toggle = within(mainNav()).getByRole("button", { name: "Services" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const menu = screen.getByRole("region", { name: "Services" });
    expect(within(menu).getByRole("heading", { name: "Registration" })).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: "GST Registration" })).toHaveAttribute(
      "href",
      "/services/gst-registration",
    );
  });

  it("has a Free Consultation button that opens WhatsApp", () => {
    render(<Header />);
    const button = screen.getByRole("link", { name: "Free Consultation" });

    expect(button.getAttribute("href")).toMatch(/^https:\/\/wa\.me\//);
    expect(button).toHaveAttribute("target", "_blank");
  });

  it("shows the Font Awesome WhatsApp icon on the consultation button", () => {
    render(<Header />);
    const button = screen.getByRole("link", { name: "Free Consultation" });

    expect(button.querySelector('svg[data-prefix="fab"][data-icon="whatsapp"]')).not.toBeNull();
  });

  it("toggles the mobile menu", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const menuButton = screen.getByRole("button", { name: "Open menu" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await user.click(menuButton);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();
  });
});
