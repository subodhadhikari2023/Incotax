import { afterEach, describe, expect, it, vi } from "vitest";

import { businessJsonLd } from "./structured-data";

describe("businessJsonLd", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("describes the firm as a LegalService with its name, slogan, URL and founders", () => {
    vi.stubEnv("SITE_URL", "https://example.test");
    expect(businessJsonLd()).toMatchObject({
      "@context": "https://schema.org",
      "@type": "LegalService",
      name: "IncoTax Legal Services",
      slogan: "Your Trust, Our Commitment!",
      url: "https://example.test",
      founder: [
        { "@type": "Person", name: "Zeeshan Khan" },
        { "@type": "Person", name: "Palak Khemka" },
      ],
    });
  });

  // Phone, email and address are still [placeholders]; Google must never see those.
  it("leaves out details that are still pending", () => {
    const data = businessJsonLd();
    expect(data).not.toHaveProperty("telephone");
    expect(data).not.toHaveProperty("email");
    expect(data).not.toHaveProperty("address");
    // No string value may start with "[" (a placeholder); arrays like founder are fine.
    expect(JSON.stringify(data)).not.toMatch(/"\[/);
  });
});
