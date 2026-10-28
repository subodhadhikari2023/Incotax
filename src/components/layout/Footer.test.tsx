import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "./Footer";

const linksIn = (heading: string) => {
  const group = screen.getByRole("navigation", { name: heading });
  return within(group)
    .getAllByRole("link")
    .map((link) => [link.textContent, link.getAttribute("href")]);
};

describe("Footer", () => {
  it("shows the brand and tagline", () => {
    render(<Footer />);

    expect(screen.getByText("IncoTax Legal Services", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("Your Trust, Our Commitment!")).toBeInTheDocument();
  });

  it("lists the quick links", () => {
    render(<Footer />);

    expect(linksIn("Quick links")).toEqual([
      ["Home", "/"],
      ["Services", "/#services"],
      ["Why IncoTax", "/why-incotax"],
      ["Contact Us", "/contact"],
    ]);
  });

  it("lists all five legal pages", () => {
    render(<Footer />);

    expect(linksIn("Legal")).toEqual([
      ["Terms and Conditions", "/terms-and-conditions"],
      ["Privacy Policy", "/privacy-policy"],
      ["Refund Policy", "/refund-policy"],
      ["Disclaimer", "/disclaimer"],
      ["Grievance Redressal", "/grievance-redressal"],
    ]);
  });

  it("shows contact details, using placeholders for pending ones", () => {
    render(<Footer />);
    const contact = screen.getByRole("region", { name: "Contact" });

    expect(within(contact).getByText("[Phone number]")).toBeInTheDocument();
    expect(within(contact).getByText("[Email address]")).toBeInTheDocument();
    expect(within(contact).getByText("[Office address]")).toBeInTheDocument();
    expect(within(contact).getByText("[Working days], 10 AM to 8 PM")).toBeInTheDocument();
  });

  it("shows the copyright line with the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear();

    expect(
      screen.getByText(`© ${year} IncoTax Legal Services. All rights reserved.`),
    ).toBeInTheDocument();
  });
});
