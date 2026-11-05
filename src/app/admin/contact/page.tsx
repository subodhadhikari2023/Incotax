import { AdminSection } from "@/components/admin/AdminSection";
import { ContentForm } from "@/components/admin/ContentForm";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { contactFormValues, contactSchema } from "@/lib/pages-content";

import { saveContactContent } from "./actions";

export default async function AdminContactPage() {
  await requireAdmin();

  // Strict read: if the store is down this fails, rather than offering a form that could overwrite
  // real content.
  const initial = contactFormValues(await readStoredContentOrThrow());

  return (
    <AdminSection
      title="Contact page"
      intro="A field left blank keeps showing its default. Phone, email, address and hours are under Business details."
    >
      <ContentForm schema={contactSchema} action={saveContactContent} initial={initial} />
    </AdminSection>
  );
}
