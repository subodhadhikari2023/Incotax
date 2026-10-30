import { describe, expect, it } from "vitest";

import { metadata } from "./layout";

describe("root layout metadata", () => {
  it("uses the firm's name as the site title", () => {
    expect(metadata.title).toBe("IncoTax Legal Services");
  });

  it("sets a base URL so canonical and Open Graph links are absolute", () => {
    expect(metadata.metadataBase).toBeInstanceOf(URL);
  });

  it("gives every page link-preview defaults (WhatsApp, social media)", () => {
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      siteName: "IncoTax Legal Services",
      locale: "en_IN",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary" });
  });
});
