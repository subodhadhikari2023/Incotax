import { AdminSection } from "@/components/admin/AdminSection";
import { EditorList } from "@/components/admin/EditorList";
import { servicesByCategory } from "@/content/services";
import { requireAdmin } from "@/lib/admin/auth";
import { readStoredContent } from "@/lib/content-store";
import { serviceCopyKey } from "@/lib/service-copy";

export default async function AdminServicesPage() {
  await requireAdmin();
  const stored = await readStoredContent();

  return (
    <AdminSection
      title="Service pages"
      intro="Each service has its own page. Choose the one you want to change."
      editing={false}
    >
      {servicesByCategory.map((category) => (
        <section key={category.id} className="mt-8">
          <h2 className="text-[28px]/[1.2] text-navy">{category.name}</h2>
          <EditorList
            items={category.services.map((service) => ({
              href: `/admin/services/${service.slug}`,
              label: service.name,
              edited: serviceCopyKey(service.slug) in stored,
            }))}
          />
        </section>
      ))}
    </AdminSection>
  );
}
