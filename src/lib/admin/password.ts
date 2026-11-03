import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SALT_BYTES = 16;
const KEY_BYTES = 64;

// "salt:hash" in hex. No "$" in the format, so env files can't expand part of the value away.
const STORED_FORMAT = new RegExp(`^([0-9a-f]{${SALT_BYTES * 2}}):([0-9a-f]{${KEY_BYTES * 2}})$`);

/** Hashes a password for the ADMIN_PASSWORD_HASH environment variable. */
export function hashPassword(password: string): string {
  if (!password) throw new Error("Password must not be empty");
  const salt = randomBytes(SALT_BYTES);
  return `${salt.toString("hex")}:${scryptSync(password, salt, KEY_BYTES).toString("hex")}`;
}

/** False for a wrong password and for a missing or malformed stored value. */
export function verifyPassword(password: string, stored: string | undefined): boolean {
  const match = stored?.match(STORED_FORMAT);
  if (!match) return false;
  const expected = Buffer.from(match[2], "hex");
  const actual = scryptSync(password, Buffer.from(match[1], "hex"), KEY_BYTES);
  return timingSafeEqual(actual, expected);
}
