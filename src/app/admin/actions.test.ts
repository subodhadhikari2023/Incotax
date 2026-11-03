// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hashPassword } from "@/lib/admin/password";
import { SESSION_MAX_AGE_SECONDS, verifySessionToken } from "@/lib/admin/session";

import { login, logout } from "./actions";

const cookieStore = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
// Next's redirect() ends the action by throwing, so the mock throws too.
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

const SECRET = "test-signing-secret";
const HASH = hashPassword("correct horse");

function form(password?: string | File) {
  const data = new FormData();
  if (password !== undefined) data.set("password", password);
  return data;
}

beforeEach(() => {
  vi.stubEnv("ADMIN_PASSWORD_HASH", HASH);
  vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("login", () => {
  it("sets a signed, HTTP-only cookie limited to /admin and opens the panel", async () => {
    await expect(login(undefined, form("correct horse"))).rejects.toThrow("redirect:/admin");

    expect(cookieStore.set).toHaveBeenCalledTimes(1);
    const [name, token, options] = cookieStore.set.mock.calls[0];
    expect(name).toBe("incotax_admin");
    expect(verifySessionToken(token, SECRET)).toBe(true);
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/admin",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  });

  it("only sends the cookie over HTTPS in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(login(undefined, form("correct horse"))).rejects.toThrow("redirect:/admin");
    expect(cookieStore.set.mock.calls[0][2]).toMatchObject({ secure: true });
  });

  it.each([
    ["a wrong password", form("wrong horse")],
    ["an empty password", form("")],
    ["no password field", form()],
    ["a file instead of text", form(new File(["correct horse"], "password.txt"))],
  ])("shows an error and sets no cookie for %s", async (_, data) => {
    await expect(login(undefined, data)).resolves.toEqual({ error: expect.any(String) });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it.each(["ADMIN_PASSWORD_HASH", "ADMIN_SESSION_SECRET"])(
    "stays locked, without crashing, when %s is not set",
    async (name) => {
      vi.stubEnv(name, "");
      await expect(login(undefined, form("correct horse"))).resolves.toEqual({
        error: expect.any(String),
      });
      expect(cookieStore.set).not.toHaveBeenCalled();
    },
  );
});

describe("logout", () => {
  it("removes the cookie from the same path and returns to the login page", async () => {
    await expect(logout()).rejects.toThrow("redirect:/admin/login");
    expect(cookieStore.delete).toHaveBeenCalledWith({ name: "incotax_admin", path: "/admin" });
  });
});
