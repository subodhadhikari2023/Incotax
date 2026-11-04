import Link from "next/link";

import { requireAdmin } from "@/lib/admin/auth";

import { logout } from "./actions";

// Panel home. Editable sections are added here as they are built.
export default async function AdminPage() {
  await requireAdmin();

  return (
    <main className="page-container flex-1 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[40px]/[46px] text-navy">Admin panel</h1>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border-[1.5px] border-navy bg-white px-6 py-3 text-base font-semibold text-navy hover:bg-tint"
          >
            Log out
          </button>
        </form>
      </div>
      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <li>
          <Link
            href="/admin/business"
            className="block rounded-[14px] border border-border bg-white p-6 text-xl font-semibold text-navy shadow-card hover:border-navy"
          >
            Business details
          </Link>
        </li>
      </ul>
    </main>
  );
}
