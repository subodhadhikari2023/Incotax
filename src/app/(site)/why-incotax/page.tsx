import type { Metadata } from "next";

import { WhyIncotaxView } from "@/components/pages/WhyIncotaxView";
import { site } from "@/content/site";
import { readStoredContent } from "@/lib/content-store";
import { mergeHomeContent } from "@/lib/home-content";
import { pageMetadata } from "@/lib/metadata";
import { founderPhotoUrls, mergeWhyIncotaxContent } from "@/lib/pages-content";

export const metadata: Metadata = pageMetadata(`Why IncoTax | ${site.name}`, "/why-incotax");

export default async function WhyIncotaxPage() {
  const stored = await readStoredContent();

  return (
    <main>
      <WhyIncotaxView
        content={mergeWhyIncotaxContent(stored)}
        stats={mergeHomeContent(stored).stats}
        photos={founderPhotoUrls(stored)}
      />
    </main>
  );
}
