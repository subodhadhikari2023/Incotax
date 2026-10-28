import { describe, expect, it } from "vitest";

import { whatsappLink } from "./whatsapp";

describe("whatsappLink", () => {
  it("builds a wa.me link with the number and an encoded message", () => {
    expect(whatsappLink("919876543210", "Hi, I need GST help & advice")).toBe(
      "https://wa.me/919876543210?text=Hi%2C%20I%20need%20GST%20help%20%26%20advice",
    );
  });

  it("strips spaces, dashes and a leading + from the number", () => {
    expect(whatsappLink("+91 98765-43210")).toBe("https://wa.me/919876543210");
  });

  it("leaves out the text parameter when there is no message", () => {
    expect(whatsappLink("919876543210")).toBe("https://wa.me/919876543210");
  });

  it("falls back to WhatsApp's contact picker while the number is pending", () => {
    expect(whatsappLink(null)).toBe("https://wa.me/");
    expect(whatsappLink(null, "Hello")).toBe("https://wa.me/?text=Hello");
  });
});
