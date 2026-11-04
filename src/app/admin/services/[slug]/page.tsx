import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/AdminSection";
import { ContentForm } from "@/components/admin/ContentForm";
import { getService } from "@/content/services";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { serviceCopyFormValues, serviceCopySchema } from "@/lib/service-copy";

import { saveServiceCopy } from "../actions";

export default async function AdminServicePage({ params }: PageProps<"/admin/services/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  // Strict read: if the store is down this fails, rather than offering a form that could overwrite
  // real content.
  const initial = serviceCopyFormValues(await readStoredContentOrThrow(), slug);

  return (
    <AdminSection
      title={service.name}
      intro="A field left blank keeps showing its default. Prices and what is included are not edited here."
      backHref="/admin/services"
      backLabel="Back to service pages"
    >
      <ContentForm
        schema={serviceCopySchema}
        action={saveServiceCopy.bind(null, slug)}
        initial={initial}
      />
    </AdminSection>
  );
}
