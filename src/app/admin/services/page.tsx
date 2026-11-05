import Link from "next/link";

import { AdminSection } from "@/components/admin/AdminSection";
import { servicesByCategory } from "@/content/services";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminServicesPage() {
  await requireAdmin();

  return (
    <AdminSection title="Service pages" intro="Choose a service to edit its text.">
      {servicesByCategory.map((category) => (
        <section key={category.id} className="mt-8">
          <h2 className="text-[28px] text-navy">{category.name}</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {category.services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/admin/services/${service.slug}`}
                  className="block rounded-[14px] border border-border bg-white p-5 font-semibold text-navy shadow-card hover:border-navy"
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </AdminSection>
  );
}
