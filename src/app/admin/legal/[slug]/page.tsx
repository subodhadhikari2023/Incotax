import { notFound } from "next/navigation";

import { LegalCanvas } from "@/components/admin/editor/canvases";
import { PageEditor } from "@/components/admin/editor/PageEditor";
import { legalLinks } from "@/content/site";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";

import { legalSection, sharedSections, sharedSettings } from "../../editor-sections";

export default async function AdminLegalEditorPage({ params }: PageProps<"/admin/legal/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const page = legalLinks.find((link) => link.href === `/${slug}`);
  if (!page) notFound();

  // Strict read: if the store is down this fails, rather than offering a page that could overwrite
  // real content.
  const stored = await readStoredContentOrThrow();

  return (
    <PageEditor
      title={page.label}
      publicHref={page.href}
      backHref="/admin/legal"
      backLabel="Legal pages"
      sections={[legalSection(stored, slug), ...sharedSections(stored)]}
      settings={sharedSettings}
    >
      <LegalCanvas slug={slug} label={page.label} />
    </PageEditor>
  );
}
