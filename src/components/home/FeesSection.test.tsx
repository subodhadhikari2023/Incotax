import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeesSection } from "./FeesSection";

describe("FeesSection", () => {
  it("shows the three Private Limited plans with their starting prices", () => {
    render(<FeesSection />);
    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(3);
    expect(cards.map((c) => within(c).getByRole("heading").textContent)).toEqual([
      "Private Limited – Basic",
      "Private Limited – Standard",
      "Private Limited – Premium",
    ]);
    expect(within(cards[0]).getByText("₹1,499")).toBeInTheDocument();
    expect(within(cards[1]).getByText("₹3,499")).toBeInTheDocument();
    expect(within(cards[2]).getByText("₹7,499")).toBeInTheDocument();
  });

  it("highlights only the Standard plan", () => {
    render(<FeesSection />);
    const cards = screen.getAllByRole("article");

    expect(cards.map((c) => c.dataset.featured)).toEqual(["false", "true", "false"]);
  });

  it("gives every plan a WhatsApp button", () => {
    render(<FeesSection />);

    for (const card of screen.getAllByRole("article")) {
      expect(within(card).getByRole("link", { name: "Chat on WhatsApp" })).toHaveAttribute(
        "href",
        expect.stringMatching(/^https:\/\/wa\.me\//),
      );
    }
  });
});
