import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/AdminSection";
import { ContentForm } from "@/components/admin/ContentForm";
import { legalLinks } from "@/content/site";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { legalFormValues, legalSchema } from "@/lib/legal-content";

import { saveLegalContent } from "../actions";

export default async function AdminLegalEditorPage({ params }: PageProps<"/admin/legal/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const page = legalLinks.find((link) => link.href === `/${slug}`);
  if (!page) notFound();

  // Strict read: if the store is down this fails, rather than offering a form that could overwrite
  // real content.
  const initial = legalFormValues(await readStoredContentOrThrow(), slug);

  return (
    <AdminSection
      title={page.label}
      intro="A field left blank keeps showing its default."
      parent={{ label: "Legal pages", href: "/admin/legal" }}
      publicHref={page.href}
    >
      <ContentForm
        schema={legalSchema}
        action={saveLegalContent.bind(null, slug)}
        initial={initial}
      />
    </AdminSection>
  );
}
