import { AdminSection } from "@/components/admin/AdminSection";
import { ContentForm } from "@/components/admin/ContentForm";
import { requireAdmin } from "@/lib/admin/auth";
import { businessFields, savedBusinessDetails, type BusinessFormValues } from "@/lib/business";
import { businessSchema } from "@/lib/business-schema";
import { readStoredContentOrThrow } from "@/lib/content-store";

import { saveBusinessDetails } from "./actions";

export default async function AdminBusinessPage() {
  await requireAdmin();

  // Only saved values, so a [placeholder] can't be saved as if it were real. Strict read: if the
  // store is down this fails, rather than offering a blank form that could overwrite real details.
  const saved = savedBusinessDetails(await readStoredContentOrThrow());
  const initial = Object.fromEntries(
    businessFields.map((field) => [field, saved[field] ?? ""]),
  ) as BusinessFormValues;

  return (
    <AdminSection
      title="Business details"
      intro="How visitors reach the firm. A field left blank keeps showing its placeholder."
      publicHref="/contact"
    >
      <ContentForm schema={businessSchema} action={saveBusinessDetails} initial={initial} />
    </AdminSection>
  );
}
