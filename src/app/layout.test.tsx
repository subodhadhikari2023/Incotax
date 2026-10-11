import { describe, expect, it } from "vitest";

import { metadata } from "./layout";

describe("root layout metadata", () => {
  it("uses the firm's name as the site title", () => {
    expect(metadata.title).toBe("IncoTax Legal Services");
  });
});
