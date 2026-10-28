"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ChatIcon, ChevronDownIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { serviceHref, servicesByCategory } from "@/content/services";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

const navLinkClass =
  "inline-flex items-center gap-1 border-b-2 py-3 text-[15px] font-semibold transition-colors";
const activeClass = "border-gold text-navy";
const idleClass = "border-transparent text-navy hover:text-gold-darkest";

function ConsultationButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={whatsappLink(site.whatsappNumber, site.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className={`items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-[15px] font-semibold text-navy shadow-button transition-colors hover:bg-gold-arrow ${className}`}
    >
      <ChatIcon />
      Free Consultation
    </a>
  );
}

/** Closes a popover on Escape or on a click outside `ref`. */
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close, ref]);
}

function ServiceLinks({ onNavigate }: { onNavigate: () => void }) {
  return servicesByCategory.map((category) => (
    <div key={category.id}>
      <h3 className="mb-3 font-sans text-[13px] font-semibold tracking-[0.1em] text-text-muted uppercase">
        {category.name}
      </h3>
      <ul className="space-y-2.5">
        {category.services.map((service) => (
          <li key={service.slug}>
            <Link
              href={serviceHref(service.slug)}
              onClick={onNavigate}
              className="text-[15px] text-navy transition-colors hover:text-gold-darkest"
            >
              {service.shortName ?? service.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ));
}

// White header: brand | nav | Free Consultation (CLAUDE.md §5). Below 1024px the nav collapses
// into a menu button; below 768px the consultation button moves into the menu.
export function Header() {
  const pathname = usePathname();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const closeServices = () => setServicesOpen(false);
  const closeMenu = () => setMenuOpen(false);
  useDismiss(servicesOpen, closeServices, servicesRef);

  const isActive = (href: string) => pathname === href;
  const servicesActive = pathname.startsWith("/services");

  const links = [
    { label: "Home", href: "/" },
    { label: "Why IncoTax", href: "/why-incotax" },
    { label: "Contact Us", href: "/contact" },
  ];
  const linkItem = (link: { label: string; href: string }) => (
    <li key={link.href}>
      <Link
        href={link.href}
        aria-current={isActive(link.href) ? "page" : undefined}
        className={`${navLinkClass} ${isActive(link.href) ? activeClass : idleClass}`}
      >
        {link.label}
      </Link>
    </li>
  );

  return (
    <header className="relative border-b border-border bg-white">
      <div className="page-container flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {/* Logo slot: placeholder until the gold SVG logo arrives (CLAUDE.md §4). */}
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-placeholder text-[13px] text-text-muted"
          >
            Logo
          </span>
          <span className="min-w-0">
            <span className="block font-heading text-[28px] leading-[1.1] font-bold text-navy">
              {site.name}
            </span>
            <span className="block text-[13px] text-text-muted">{site.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {linkItem(links[0])}
            <li ref={servicesRef} className="relative">
              <button
                type="button"
                aria-expanded={servicesOpen}
                aria-controls="services-menu"
                data-active={servicesActive}
                onClick={() => setServicesOpen((open) => !open)}
                className={`${navLinkClass} ${servicesActive ? activeClass : idleClass}`}
              >
                Services
                <ChevronDownIcon
                  className={`size-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {servicesOpen && (
                <section
                  id="services-menu"
                  aria-label="Services"
                  className="absolute top-full left-1/2 z-20 mt-3 grid w-max -translate-x-1/2 grid-cols-3 gap-10 rounded-[14px] border border-border bg-white p-8 shadow-card"
                >
                  <ServiceLinks onNavigate={closeServices} />
                </section>
              )}
            </li>
            {links.slice(1).map(linkItem)}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <ConsultationButton className="hidden md:inline-flex" />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-12 items-center justify-center rounded-[10px] border border-border text-navy lg:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full z-20 max-h-[calc(100vh-8rem)] overflow-y-auto border-t border-border bg-white shadow-card lg:hidden"
        >
          <div className="page-container space-y-8 py-6">
            <ul className="space-y-1">
              {[links[0], ...links.slice(1)].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`block py-2 text-base font-semibold ${isActive(link.href) ? "text-gold-darkest" : "text-navy"}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="grid gap-8 md:grid-cols-3">
              <ServiceLinks onNavigate={closeMenu} />
            </div>
            <ConsultationButton className="flex w-full md:hidden" />
          </div>
        </nav>
      )}
    </header>
  );
}
