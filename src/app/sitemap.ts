import type { MetadataRoute } from "next";

import { serviceHref, services } from "@/content/services";
import { legalLinks } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

// Served as /sitemap.xml: every public page, built once at build time.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/why-incotax",
    "/contact",
    ...services.map((s) => serviceHref(s.slug)),
    ...legalLinks.map((l) => l.href),
  ];
  return paths.map((path) => ({ url: new URL(path, siteUrl()).href }));
}
