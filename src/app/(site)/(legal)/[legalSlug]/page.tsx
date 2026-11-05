import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalView } from "@/components/pages/LegalView";
import { legalLinks, site } from "@/content/site";
import { readStoredContent } from "@/lib/content-store";
import { legalContentFor } from "@/lib/legal-content";
import { pageMetadata } from "@/lib/metadata";

// One template for the five legal pages. Until a page's text is saved in the admin panel, the
// designed section layout is filled with placeholders. Other slugs are a 404.
export const dynamicParams = false;

const pageFor = (slug: string) => legalLinks.find((l) => l.href === `/${slug}`);

export function generateStaticParams() {
  return legalLinks.map((l) => ({ legalSlug: l.href.slice(1) }));
}

export async function generateMetadata({ params }: PageProps<"/[legalSlug]">): Promise<Metadata> {
  const { legalSlug } = await params;
  const page = pageFor(legalSlug);
  return page ? pageMetadata(`${page.label} | ${site.name}`, page.href) : { title: site.name };
}

export default async function LegalPage({ params }: PageProps<"/[legalSlug]">) {
  const { legalSlug } = await params;
  const page = pageFor(legalSlug);
  if (!page) notFound();
  const legal = legalContentFor(await readStoredContent(), legalSlug);

  return (
    <main>
      <LegalView label={page.label} legal={legal} />
    </main>
  );
}
