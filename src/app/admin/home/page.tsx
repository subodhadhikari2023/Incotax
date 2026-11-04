import { AdminSection } from "@/components/admin/AdminSection";
import { HomeForm } from "@/components/admin/HomeForm";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContentOrThrow } from "@/lib/content-store";
import { homeFormValues } from "@/lib/home-content";

export default async function AdminHomePage() {
  await requireAdmin();

  // Strict read: if the store is down this fails, rather than offering a form that could overwrite
  // real content.
  const initial = homeFormValues(await readStoredContentOrThrow());

  return (
    <AdminSection
      title="Home page"
      intro="A text field left blank keeps showing its default. Saving also applies every list below, so an empty list hides its section."
    >
      <HomeForm initial={initial} />
    </AdminSection>
  );
}
