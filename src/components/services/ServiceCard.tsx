import Link from "next/link";

import { ArrowRightIcon, CategoryIcon } from "@/components/icons";
import { serviceHref, type Service } from "@/content/services";
import { pageCopy } from "@/content/site";

// White service card: icon tile, name, short description, "Learn more →" (CLAUDE.md §6).
export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex flex-col rounded-[20px] bg-white p-7 shadow-card">
      <span className="flex size-[52px] items-center justify-center rounded-xl bg-gold-tint text-navy">
        <CategoryIcon category={service.category} />
      </span>
      <h3 className="mt-6 font-sans text-xl font-semibold text-navy">{service.name}</h3>
      <p className="mt-3 flex-1 text-[15px] text-text-muted">{pageCopy.serviceCardDescription}</p>
      <Link
        href={serviceHref(service.slug)}
        className="mt-6 inline-flex items-center gap-2.5 text-[15px] font-semibold text-navy hover:text-gold-darkest"
      >
        Learn more<span className="sr-only"> about {service.name}</span>
        <ArrowRightIcon className="text-sm text-gold-deep" />
      </Link>
    </article>
  );
}
