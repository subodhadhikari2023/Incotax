import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WhatsAppNumberProvider } from "@/components/WhatsAppNumber";

import { WhatsAppButton } from "./WhatsAppButton";

describe("WhatsAppButton", () => {
  it("opens the contact picker while no number is saved", () => {
    render(
      <WhatsAppNumberProvider number={null}>
        <WhatsAppButton message={null} />
      </WhatsAppNumberProvider>,
    );
    expect(screen.getByRole("link", { name: "Chat on WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\/\?text=/),
    );
  });

  it("uses the saved number", () => {
    render(
      <WhatsAppNumberProvider number="919000000000">
        <WhatsAppButton message="Hello" />
      </WhatsAppNumberProvider>,
    );
    expect(screen.getByRole("link", { name: "Chat on WhatsApp" })).toHaveAttribute(
      "href",
      "https://wa.me/919000000000?text=Hello",
    );
  });
});
