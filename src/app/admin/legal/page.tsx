import Link from "next/link";

import { AdminSection } from "@/components/admin/AdminSection";
import { legalLinks } from "@/content/site";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminLegalPage() {
  await requireAdmin();

  return (
    <AdminSection title="Legal pages" intro="Choose a page to edit its text.">
      <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {legalLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={`/admin/legal${link.href}`}
              className="block rounded-[14px] border border-border bg-white p-5 font-semibold text-navy shadow-card hover:border-navy"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </AdminSection>
  );
}
