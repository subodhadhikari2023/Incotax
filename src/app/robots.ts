import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

// Served as /robots.txt: all crawlers welcome, pointed at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
