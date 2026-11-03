// @vitest-environment node
import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("stores a hex salt and hash, without the password", () => {
    const stored = hashPassword("correct horse");
    expect(stored).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(stored).not.toContain("correct horse");
  });

  it("gives the same password a different hash each time", () => {
    expect(hashPassword("correct horse")).not.toBe(hashPassword("correct horse"));
  });

  it("refuses an empty password", () => {
    expect(() => hashPassword("")).toThrow();
  });
});

describe("verifyPassword", () => {
  const stored = hashPassword("correct horse");

  it("accepts the right password", () => {
    expect(verifyPassword("correct horse", stored)).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(verifyPassword("wrong horse", stored)).toBe(false);
    expect(verifyPassword("", stored)).toBe(false);
  });

  // A missing or mistyped environment variable must lock the admin panel, not crash or open it.
  it.each([undefined, "", "abc", "zz:zz", "abcd:", ":abcd", "00:00", `${stored}:00`])(
    "rejects the malformed stored value %s",
    (bad) => {
      expect(verifyPassword("correct horse", bad)).toBe(false);
    },
  );
});
