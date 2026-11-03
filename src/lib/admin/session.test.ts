// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createSessionToken, SESSION_MAX_AGE_SECONDS, verifySessionToken } from "./session";

const SECRET = "test-signing-secret";
const NOW = 1_800_000_000_000;
const MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

describe("createSessionToken", () => {
  it("refuses to sign without a secret", () => {
    expect(() => createSessionToken("", NOW)).toThrow();
    expect(() => createSessionToken(undefined, NOW)).toThrow();
  });
});

describe("verifySessionToken", () => {
  const token = createSessionToken(SECRET, NOW);

  it("accepts a fresh token signed with the same secret", () => {
    expect(verifySessionToken(token, SECRET, NOW)).toBe(true);
    expect(verifySessionToken(token, SECRET, NOW + MAX_AGE_MS - 1)).toBe(true);
  });

  it("rejects an expired token", () => {
    expect(verifySessionToken(token, SECRET, NOW + MAX_AGE_MS)).toBe(false);
  });

  it("rejects a token signed with another secret", () => {
    expect(verifySessionToken(token, "another-secret", NOW)).toBe(false);
  });

  it("rejects a token whose expiry was changed", () => {
    const [expires, signature] = token.split(".");
    const extended = `${Number(expires) + MAX_AGE_MS}.${signature}`;
    expect(verifySessionToken(extended, SECRET, NOW + MAX_AGE_MS)).toBe(false);
  });

  it("rejects everything when the secret is missing", () => {
    expect(verifySessionToken(token, "", NOW)).toBe(false);
    expect(verifySessionToken(token, undefined, NOW)).toBe(false);
  });

  it.each([undefined, "", "abc", ".", "123.", ".abc", "abc.def", `${token}.00`])(
    "rejects the malformed token %s",
    (bad) => {
      expect(verifySessionToken(bad, SECRET, NOW)).toBe(false);
    },
  );
});
