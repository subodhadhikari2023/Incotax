import Link from "next/link";

import { logout } from "@/app/admin/actions";

import { AdminNav } from "./AdminNav";

// What every page of the panel shares once logged in: the top bar and the section menu.
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-navy text-white">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 md:px-8">
          <Link href="/admin" className="font-heading text-[22px] font-bold text-white">
            IncoTax admin
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 text-[15px] font-semibold text-white underline hover:text-gold"
            >
              View site <span aria-hidden="true">↗</span>
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border-[1.5px] border-white px-4 py-2 text-[15px] font-semibold text-white hover:bg-navy-deep"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1 lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
        <div className="lg:border-r lg:border-border lg:bg-white">
          <div className="lg:sticky lg:top-0">
            <AdminNav />
          </div>
        </div>
        <main className="min-w-0 px-5 py-8 md:px-8 lg:py-10">
          <div className="mx-auto max-w-[860px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
