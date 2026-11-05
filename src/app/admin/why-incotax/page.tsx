import { WhyIncotaxCanvas } from "@/components/admin/editor/canvases";
import { PageEditor } from "@/components/admin/editor/PageEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";

import {
  founderPhotoSections,
  homeSection,
  sharedSections,
  sharedSettings,
  whyIncotaxSection,
} from "../editor-sections";

export default async function AdminWhyIncotaxPage() {
  await requireAdmin();

  // Strict read: if the store is down this fails, rather than offering a page that could overwrite
  // real content.
  const stored = await readStoredContentOrThrow();

  return (
    <PageEditor
      title="Why IncoTax"
      publicHref="/why-incotax"
      sections={[
        whyIncotaxSection(stored),
        ...founderPhotoSections(stored),
        homeSection(stored),
        ...sharedSections(stored),
      ]}
      settings={sharedSettings}
    >
      <WhyIncotaxCanvas />
    </PageEditor>
  );
}
