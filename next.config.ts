import type { NextConfig } from "next";

import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Security headers on every route; Netlify's Next.js runtime applies these as well.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
