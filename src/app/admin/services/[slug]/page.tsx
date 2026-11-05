import { notFound } from "next/navigation";

import { ServiceCanvas } from "@/components/admin/editor/canvases";
import { PageEditor } from "@/components/admin/editor/PageEditor";
import { serviceHref } from "@/content/services";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { catalogEntry, otherServicesFrom, publicServices } from "@/lib/service-catalog";
import { serviceCopyKey } from "@/lib/service-copy";

import { serviceSection, sharedSections, sharedSettings } from "../../editor-sections";
import { publishServiceAction } from "../catalog-actions";

export default async function AdminServicePage({ params }: PageProps<"/admin/services/[slug]">) {
  await requireAdmin();
  const { slug } = await params;

  // Strict read: if the store is down this fails, rather than offering a page that could overwrite
  // real content.
  const stored = await readStoredContentOrThrow();
  const entry = catalogEntry(stored, slug);
  if (!entry) notFound();

  const list = publicServices(stored);
  const others = otherServicesFrom(list, slug);
  const notice =
    entry.status === "draft"
      ? "Draft: not on the site yet."
      : entry.status === "hidden"
        ? "Hidden from the site. Restore it from the Service pages list."
        : undefined;

  return (
    <PageEditor
      title={entry.name}
      publicHref={entry.status === "published" ? serviceHref(slug) : undefined}
      backHref="/admin/services"
      backLabel="Service pages"
      notice={notice}
      publish={entry.status === "draft" ? publishServiceAction.bind(null, slug) : undefined}
      serviceList={list}
      sections={[
        serviceSection(stored, slug),
        ...others.map((other) => serviceSection(stored, other.slug)),
        ...sharedSections(stored),
      ]}
      settings={[{ section: serviceCopyKey(slug), name: "whatsappMessage" }, ...sharedSettings]}
    >
      <ServiceCanvas service={entry} others={others} />
    </PageEditor>
  );
}
