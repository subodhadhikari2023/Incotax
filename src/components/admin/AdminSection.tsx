import Link from "next/link";

import { AdminShell } from "./AdminShell";

// The frame around a list of pages to choose from: the way back, what this list is, and the list.
export function AdminSection({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-text-muted">
          <li>
            <Link href="/admin" className="underline hover:text-navy">
              Admin panel
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true">›</span>
            <span aria-current="page" className="font-semibold text-navy">
              {title}
            </span>
          </li>
        </ol>
      </nav>
      <h1 className="mt-6 text-[36px]/[1.15] text-navy md:text-[44px]">{title}</h1>
      <p className="mt-3 text-[17px] text-text-body">{intro}</p>
      {children}
    </AdminShell>
  );
}
