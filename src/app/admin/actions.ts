"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyPassword } from "@/lib/admin/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/admin/session";

export type LoginState = { error: string } | undefined;

// The cookie is limited to /admin, so public pages never receive it.
const COOKIE_PATH = "/admin";

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  const secret = process.env.ADMIN_SESSION_SECRET;
  // A missing environment variable looks like a wrong password, so the panel stays locked.
  if (
    typeof password !== "string" ||
    !secret ||
    !verifyPassword(password, process.env.ADMIN_PASSWORD_HASH)
  ) {
    return { error: "That password is not correct." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE, path: COOKIE_PATH });
  redirect("/admin/login");
}
