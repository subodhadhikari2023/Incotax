"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { activeSection, adminSectionGroups, adminSections } from "@/lib/admin/sections";

const linkClass =
  "block shrink-0 rounded-lg border-l-4 px-3 py-2.5 text-[15px] whitespace-nowrap text-navy lg:whitespace-normal";
const idle = "border-transparent hover:bg-tint";
const current = "border-gold bg-gold-tint font-semibold";

// The panel's menu: a sliding row on phones and tablets, a column beside the page on desktop.
export function AdminNav() {
  const pathname = usePathname();
  const active = activeSection(pathname);
  const activeLink = useRef<HTMLAnchorElement>(null);

  // On a small screen the current section may be off to the side of the sliding row.
  useEffect(() => {
    activeLink.current?.scrollIntoView?.({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav aria-label="Admin sections" className="border-b border-border bg-white lg:border-b-0">
      <div className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible lg:p-4">
        <Link
          href="/admin"
          aria-current={pathname === "/admin" ? "page" : undefined}
          className={`${linkClass} ${pathname === "/admin" ? current : idle}`}
        >
          Overview
        </Link>
        {adminSectionGroups.map((group) => (
          <div key={group} className="contents">
            <p className="mt-4 mb-1 hidden px-3 text-[13px] font-semibold tracking-[0.1em] text-text-muted uppercase lg:block">
              {group}
            </p>
            {adminSections
              .filter((section) => section.group === group)
              .map((section) => {
                const isActive = section === active;
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    ref={isActive ? activeLink : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={`${linkClass} ${isActive ? current : idle}`}
                  >
                    {section.label}
                  </Link>
                );
              })}
          </div>
        ))}
      </div>
    </nav>
  );
}
