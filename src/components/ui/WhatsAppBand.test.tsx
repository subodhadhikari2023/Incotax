import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WhatsAppBand } from "./WhatsAppBand";

describe("WhatsAppBand", () => {
  it("opens WhatsApp with the message it is given", () => {
    render(<WhatsAppBand message="Hi, I need GST registration." />);
    expect(screen.getByRole("link", { name: "Chat on WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringContaining("?text=Hi%2C%20I%20need%20GST%20registration."),
    );
  });
});
