import { SiteCanvas } from "@/components/admin/editor/canvases";
import { PageEditor } from "@/components/admin/editor/PageEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { publicServices } from "@/lib/service-catalog";

import { sharedSections, sharedSettings } from "../editor-sections";

export default async function AdminSitePage() {
  await requireAdmin();

  // Strict read: if the store is down this fails, rather than offering a page that could overwrite
  // real content.
  const stored = await readStoredContentOrThrow();

  return (
    <PageEditor
      serviceList={publicServices(stored)}
      title="Site-wide text"
      publicHref="/"
      sections={sharedSections(stored)}
      settings={[...sharedSettings, { section: "site", name: "afterSubmit" }]}
    >
      <SiteCanvas />
    </PageEditor>
  );
}
