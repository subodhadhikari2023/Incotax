/**
 * Content-Security-Policy: the site may only load its own files. Inline scripts and styles stay
 * allowed because Next's static pages ship small inline bootstrap scripts (nonces would make every
 * page dynamic). The dev server additionally needs eval and a websocket for hot reload.
 */
export function contentSecurityPolicy(dev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

// Sent with every response (next.config.ts headers()).
export const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy(process.env.NODE_ENV === "development"),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];
