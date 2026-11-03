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
      <p className="mt-4 text-text-body">You are logged in. No sections are editable yet.</p>
    </main>
  );
}
