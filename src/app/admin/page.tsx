import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminSectionGroups, adminSections } from "@/lib/admin/sections";

// Panel home: every section, saying in plain words what it changes.
export default async function AdminPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <h1 className="text-[36px]/[1.15] text-navy md:text-[44px]">Admin panel</h1>
      <p className="mt-3 text-[17px] text-text-body">
        Choose what you want to change. Nothing on the site changes until you save.
      </p>
      {adminSectionGroups.map((group) => (
        <section key={group} className="mt-10">
          <h2 className="text-[28px]/[1.2] text-navy">{group}</h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {adminSections
              .filter((section) => section.group === group)
              .map((section) => (
                <li key={section.href} className="h-full">
                  <Link
                    href={section.href}
                    className="block h-full rounded-[14px] border border-border bg-white p-6 shadow-card hover:border-navy"
                  >
                    <span className="block text-xl font-semibold text-navy">{section.label}</span>
                    <span className="mt-1 block text-[15px] text-text-muted">
                      {section.description}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </AdminShell>
  );
}
