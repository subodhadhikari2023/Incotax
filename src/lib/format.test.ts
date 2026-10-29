import { describe, expect, it } from "vitest";

import { formatINR } from "./format";

describe("formatINR", () => {
  it("formats rupees with Indian digit grouping", () => {
    expect(formatINR(1499)).toBe("₹1,499");
    expect(formatINR(25000)).toBe("₹25,000");
    expect(formatINR(150000)).toBe("₹1,50,000");
  });

  it("formats zero", () => {
    expect(formatINR(0)).toBe("₹0");
  });
});
