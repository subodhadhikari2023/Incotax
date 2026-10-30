import type { Metadata } from "next";

import { site } from "@/content/site";

// Next replaces (not merges) a parent's openGraph when a page sets its own, so every page
// repeats these defaults alongside its title and URL.
export const openGraphDefaults = {
  type: "website",
  siteName: site.name,
  locale: "en_IN",
} as const;

/** Title, canonical link and link-preview tags for one page; `path` is relative to metadataBase. */
export function pageMetadata(title: string, path: string): Metadata {
  return {
    title,
    alternates: { canonical: path },
    openGraph: { ...openGraphDefaults, title, url: path },
  };
}
