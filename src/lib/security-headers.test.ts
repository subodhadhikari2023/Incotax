import { describe, expect, it } from "vitest";

import { contentSecurityPolicy, securityHeaders } from "./security-headers";

const header = (name: string) => securityHeaders.find((h) => h.key === name)?.value;

describe("security headers", () => {
  it("only allows the site's own files, and no framing, plugins or outside form targets", () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("allows eval and the hot-reload socket only for the dev server", () => {
    const csp = contentSecurityPolicy(true);
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toMatch(/connect-src 'self' ws:/);
  });

  it("sets the standard hardening headers", () => {
    expect(header("Content-Security-Policy")).toBeDefined();
    expect(header("X-Frame-Options")).toBe("DENY");
    expect(header("X-Content-Type-Options")).toBe("nosniff");
    expect(header("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(header("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains");
  });
});
