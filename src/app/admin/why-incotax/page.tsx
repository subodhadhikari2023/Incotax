import { AdminSection } from "@/components/admin/AdminSection";
import { ContentForm } from "@/components/admin/ContentForm";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { whyIncotaxFormValues, whyIncotaxSchema } from "@/lib/pages-content";

import { saveWhyIncotaxContent } from "./actions";

export default async function AdminWhyIncotaxPage() {
  await requireAdmin();

  // Strict read: if the store is down this fails, rather than offering a form that could overwrite
  // real content.
  const initial = whyIncotaxFormValues(await readStoredContentOrThrow());

  return (
    <AdminSection
      title="Why IncoTax"
      publicHref="/why-incotax"
      intro="A text field left blank keeps showing its default. Saving also applies every list below."
    >
      <ContentForm schema={whyIncotaxSchema} action={saveWhyIncotaxContent} initial={initial} />
    </AdminSection>
  );
}
