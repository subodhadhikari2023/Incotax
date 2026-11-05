import { notFound } from "next/navigation";

import { ServiceCanvas } from "@/components/admin/editor/canvases";
import { PageEditor } from "@/components/admin/editor/PageEditor";
import { getService, otherServices, serviceHref } from "@/content/services";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { serviceCopyKey } from "@/lib/service-copy";

import { serviceSection, sharedSections, sharedSettings } from "../../editor-sections";

export default async function AdminServicePage({ params }: PageProps<"/admin/services/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  // Strict read: if the store is down this fails, rather than offering a page that could overwrite
  // real content.
  const stored = await readStoredContentOrThrow();

  return (
    <PageEditor
      title={service.name}
      publicHref={serviceHref(slug)}
      backHref="/admin/services"
      backLabel="Service pages"
      sections={[
        serviceSection(stored, slug),
        ...otherServices(slug).map((other) => serviceSection(stored, other.slug)),
        ...sharedSections(stored),
      ]}
      settings={[{ section: serviceCopyKey(slug), name: "whatsappMessage" }, ...sharedSettings]}
    >
      <ServiceCanvas slug={slug} />
    </PageEditor>
  );
}
