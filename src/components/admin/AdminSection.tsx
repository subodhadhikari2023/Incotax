import Link from "next/link";

import { Eyebrow } from "@/components/ui/Eyebrow";

import { AdminShell } from "./AdminShell";

// The frame around an editor: the way back, what is being edited, and the live page it changes.
// List pages pass editing={false}: nothing there can be saved, so the warning would only confuse.
export function AdminSection({
  title,
  intro,
  parent,
  publicHref,
  editing = true,
  children,
}: {
  title: string;
  intro: string;
  /** The list page this editor was opened from, if any. */
  parent?: { label: string; href: string };
  /** The public page this editor changes, when one page shows it all. */
  publicHref?: string;
  editing?: boolean;
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
          {parent && (
            <li className="flex items-center gap-2">
              <span aria-hidden="true">›</span>
              <Link href={parent.href} className="underline hover:text-navy">
                {parent.label}
              </Link>
            </li>
          )}
          <li className="flex items-center gap-2">
            <span aria-hidden="true">›</span>
            <span aria-current="page" className="font-semibold text-navy">
              {title}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-6">
        {editing && <Eyebrow>You are editing</Eyebrow>}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h1 className="text-[36px]/[1.15] text-navy md:text-[44px]">{title}</h1>
          {publicHref && (
            <a
              href={publicHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border-[1.5px] border-navy bg-white px-4 py-2.5 text-[15px] font-semibold text-navy hover:bg-tint"
            >
              View this page on the live site <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        <p className="mt-3 text-[17px] text-text-body">{intro}</p>
        {editing && (
          <p className="mt-4 rounded-lg bg-gold-tint px-4 py-3 text-[15px] text-navy">
            <strong>Nothing changes until you save.</strong> Saving updates the live site straight
            away.
          </p>
        )}
      </div>

      {children}
    </AdminShell>
  );
}
