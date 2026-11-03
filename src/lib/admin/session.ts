import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "incotax_admin";

/** How long a login lasts. Interim default. */
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

const TOKEN_FORMAT = /^(\d+)\.([0-9a-f]{64})$/;

function sign(expires: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(expires).digest();
}

/** A token is "<expiry in ms>.<signature of the expiry>", so changing the expiry breaks it. */
export function createSessionToken(secret: string | undefined, now = Date.now()): string {
  if (!secret) throw new Error("Session secret must not be empty");
  const expires = String(now + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expires}.${sign(expires, secret).toString("hex")}`;
}

/** False for anything but an unexpired token signed with this secret, or if the secret is missing. */
export function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now(),
): boolean {
  const match = token?.match(TOKEN_FORMAT);
  if (!match || !secret) return false;
  const [, expires, signature] = match;
  if (!timingSafeEqual(sign(expires, secret), Buffer.from(signature, "hex"))) return false;
  return now < Number(expires);
}
