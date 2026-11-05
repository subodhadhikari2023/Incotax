import type { MetadataRoute } from "next";

import { serviceHref } from "@/content/services";
import { legalLinks } from "@/content/site";
import { readStoredContent } from "@/lib/content-store";
import { publicServices } from "@/lib/service-catalog";
import { siteUrl } from "@/lib/site-url";

// Served as /sitemap.xml: every public page. Built on request, as services can be added any time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    "/",
    "/why-incotax",
    "/contact",
    ...publicServices(await readStoredContent()).map((s) => serviceHref(s.slug)),
    ...legalLinks.map((l) => l.href),
  ];
  return paths.map((path) => ({ url: new URL(path, siteUrl()).href }));
}
