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
  // Uploaded images: their addresses carry a version, so allow any query on them. Client logos
  // (public/clients) and the IncoTax emblem (public/logo) are fixed files.
  images: {
    localPatterns: [
      { pathname: "/media/**" },
      { pathname: "/clients/**", search: "" },
      { pathname: "/logo/**", search: "" },
    ],
  },
  // Room for a 4 MB photo, the largest thing the admin panel sends.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // Security headers on every route; Netlify's Next.js runtime applies these as well.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
