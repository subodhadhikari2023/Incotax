import { AdminSection } from "@/components/admin/AdminSection";
import { EditorList } from "@/components/admin/EditorList";
import { legalLinks } from "@/content/site";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContent } from "@/lib/content-store";
import { legalContentKey } from "@/lib/legal-content";

export default async function AdminLegalPage() {
  await requireAdmin();
  const stored = await readStoredContent();

  return (
    <AdminSection
      title="Legal pages"
      intro="Each legal page has its own text. Choose the one you want to change."
    >
      <EditorList
        items={legalLinks.map((link) => ({
          href: `/admin/legal${link.href}`,
          label: link.label,
          edited: legalContentKey(link.href.slice(1)) in stored,
        }))}
      />
    </AdminSection>
  );
}
