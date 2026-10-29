import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeeBox } from "./FeeBox";

describe("FeeBox", () => {
  it("shows the starting price and the plan rows", () => {
    render(
      <FeeBox
        pricing={{
          kind: "from",
          amount: 1499,
          rows: [
            { label: "Basic", value: "₹1,499" },
            { label: "Standard", value: "₹3,499" },
          ],
        }}
        notIncluded="Government fees."
      />,
    );
    const box = screen.getByRole("region", { name: "Fee for this service" });

    expect(within(box).getByText("Starting from")).toBeInTheDocument();
    expect(within(box).getByText("₹1,499", { selector: "p" })).toBeInTheDocument();
    expect(within(box).getByText("Standard")).toBeInTheDocument();
    expect(within(box).getByText("Not included: Government fees.")).toBeInTheDocument();
    expect(within(box).getByRole("link", { name: "Chat on WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\//),
    );
  });

  it("labels a fixed fee and shows its suffix", () => {
    render(
      <FeeBox pricing={{ kind: "fixed", amount: 2499, suffix: "+ government fee", rows: [] }} />,
    );

    expect(screen.getByText("Fixed fee")).toBeInTheDocument();
    expect(screen.getByText("+ government fee")).toBeInTheDocument();
  });

  it("shows no price for quote-only services", () => {
    render(<FeeBox pricing={{ kind: "quote", text: "Contact us for a quote." }} />);
    const box = screen.getByRole("region", { name: "Fee for this service" });

    expect(within(box).queryByText(/₹/)).toBeNull();
    expect(within(box).getByText("Contact us for a quote.")).toBeInTheDocument();
    expect(within(box).getByRole("link", { name: "Get a quote on WhatsApp" })).toBeInTheDocument();
  });
});
