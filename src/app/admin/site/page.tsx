import { AdminSection } from "@/components/admin/AdminSection";
import { ContentForm } from "@/components/admin/ContentForm";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { siteCopyFormValues, siteCopySchema } from "@/lib/site-copy";

import { saveSiteCopy } from "./actions";

export default async function AdminSitePage() {
  await requireAdmin();

  // Strict read: if the store is down this fails, rather than offering a form that could overwrite
  // real content.
  const initial = siteCopyFormValues(await readStoredContentOrThrow());

  return (
    <AdminSection
      title="Site-wide text"
      intro="Text used on many pages. A field left blank keeps showing its default."
    >
      <ContentForm schema={siteCopySchema} action={saveSiteCopy} initial={initial} />
    </AdminSection>
  );
}
