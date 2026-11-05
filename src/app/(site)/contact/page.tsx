import type { Metadata } from "next";

import { ContactView } from "@/components/pages/ContactView";
import { site } from "@/content/site";
import { mergeBusinessDetails } from "@/lib/business";
import { readStoredContent } from "@/lib/content-store";
import { pageMetadata } from "@/lib/metadata";
import { mergeContactContent } from "@/lib/pages-content";

export const metadata: Metadata = pageMetadata(`Contact Us | ${site.name}`, "/contact");

export default async function ContactPage() {
  const stored = await readStoredContent();

  return (
    <main>
      <ContactView contact={mergeContactContent(stored)} business={mergeBusinessDetails(stored)} />
    </main>
  );
}
