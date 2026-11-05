import { ContactCanvas } from "@/components/admin/editor/canvases";
import { PageEditor } from "@/components/admin/editor/PageEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { publicServices } from "@/lib/service-catalog";

import { contactSection, sharedSections, sharedSettings } from "../editor-sections";

export default async function AdminBusinessPage() {
  await requireAdmin();

  // Strict read: if the store is down this fails, rather than offering a page that could overwrite
  // real content.
  const stored = await readStoredContentOrThrow();

  return (
    <PageEditor
      serviceList={publicServices(stored)}
      title="Business details"
      publicHref="/contact"
      sections={[...sharedSections(stored), contactSection(stored)]}
      settings={sharedSettings}
    >
      <ContactCanvas />
    </PageEditor>
  );
}
