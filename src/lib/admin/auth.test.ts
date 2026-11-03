// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isLoggedIn, requireAdmin } from "./auth";
import { createSessionToken, SESSION_MAX_AGE_SECONDS } from "./session";

const cookieStore = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

const SECRET = "test-signing-secret";
const useCookie = (value?: string) =>
  cookieStore.get.mockImplementation((name: string) =>
    name === "incotax_admin" && value !== undefined ? { name, value } : undefined,
  );

beforeEach(() => {
  vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("isLoggedIn", () => {
  it("is true with a valid session cookie", async () => {
    useCookie(createSessionToken(SECRET));
    await expect(isLoggedIn()).resolves.toBe(true);
  });

  it("is false with no cookie, a forged cookie or an expired cookie", async () => {
    useCookie(undefined);
    await expect(isLoggedIn()).resolves.toBe(false);

    useCookie(createSessionToken("another-secret"));
    await expect(isLoggedIn()).resolves.toBe(false);

    useCookie(createSessionToken(SECRET, Date.now() - SESSION_MAX_AGE_SECONDS * 1000));
    await expect(isLoggedIn()).resolves.toBe(false);
  });

  it("is false when the signing secret is not set", async () => {
    useCookie(createSessionToken(SECRET));
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    await expect(isLoggedIn()).resolves.toBe(false);
  });
});

describe("requireAdmin", () => {
  it("lets a logged-in admin continue", async () => {
    useCookie(createSessionToken(SECRET));
    await expect(requireAdmin()).resolves.toBeUndefined();
  });

  it("sends everyone else to the login page", async () => {
    useCookie(undefined);
    await expect(requireAdmin()).rejects.toThrow("redirect:/admin/login");
  });
});
