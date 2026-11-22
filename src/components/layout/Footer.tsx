import Image from "next/image";
import Link from "next/link";

import { SocialLinks } from "@/components/ui/SocialLinks";
import { legalLinks, quickLinks, site, type NavLink } from "@/content/site";
import type { BusinessNodes } from "@/lib/business";

const headingClass = "mb-5 text-[13px] font-semibold tracking-[0.1em] text-gold uppercase";

function LinkGroup({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className={`${headingClass} font-sans`}>{title}</h2>
      <ul className="space-y-3.5 text-[15px]">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-on-navy transition-colors hover:text-gold">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Navy-deep footer: 4 columns on desktop, 2×2 on tablet, 1 column on phones.
export function Footer({ business = site }: { business?: BusinessNodes }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-deep text-on-navy">
      <div className="mx-auto w-full max-w-[1264px] px-8 pt-14 md:pt-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-y-12 lg:grid-cols-4">
          <div>
            <Image
              src="/logo/incotax-icon-on-dark.png"
              alt=""
              width={56}
              height={56}
              unoptimized
              className="mb-4 size-14"
            />
            <p className="font-heading text-[28px] leading-tight font-bold text-white">
              {site.name}
            </p>
            <p className="mt-3 text-sm">{site.tagline}</p>
            <SocialLinks links={business} className="mt-5" />
            {business.socialEdit}
          </div>

          <LinkGroup title="Quick links" links={quickLinks} />
          <LinkGroup title="Legal" links={legalLinks} />

          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className={`${headingClass} font-sans`}>
              Contact
            </h2>
            <ul className="space-y-3.5 text-[15px]">
              <li>{business.phone}</li>
              <li>{business.email}</li>
              <li>{business.address}</li>
              <li>{business.hours}</li>
            </ul>
          </section>
        </div>

        <p className="mt-12 border-t border-navy-line py-8 text-center text-[13px] text-footer-muted">
          {`© ${year} ${site.name}. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
