import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function isLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
    process.env.ADMIN_SESSION_SECRET,
  );
}

/** Call first in every admin page and Server Action: layouts don't re-run on every navigation. */
export async function requireAdmin(): Promise<void> {
  if (!(await isLoggedIn())) redirect("/admin/login");
}
