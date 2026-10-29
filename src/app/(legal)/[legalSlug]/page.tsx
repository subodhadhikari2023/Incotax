import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/ui/PageHero";
import { legal } from "@/content/pages";
import { legalLinks, site } from "@/content/site";

// One template for the five legal pages (CLAUDE.md §6.5). The text is PENDING (Zeeshan has it),
// so the designed section layout is filled with placeholders. Other slugs are a 404.
export const dynamicParams = false;

const pageFor = (slug: string) => legalLinks.find((l) => l.href === `/${slug}`);

export function generateStaticParams() {
  return legalLinks.map((l) => ({ legalSlug: l.href.slice(1) }));
}

export async function generateMetadata({ params }: PageProps<"/[legalSlug]">): Promise<Metadata> {
  const { legalSlug } = await params;
  const page = pageFor(legalSlug);
  return { title: page ? `${page.label} | ${site.name}` : site.name };
}

export default async function LegalPage({ params }: PageProps<"/[legalSlug]">) {
  const { legalSlug } = await params;
  const page = pageFor(legalSlug);
  if (!page) notFound();

  return (
    <main>
      <PageHero
        title={page.label}
        breadcrumb={[{ label: "Home", href: "/" }, { label: page.label }]}
      >
        <p className="mt-5 text-[17px] text-on-navy">{`Last updated: ${legal.lastUpdated}`}</p>
      </PageHero>

      <div className="bg-white">
        <div className="page-container grid items-start gap-10 py-[53px] md:py-[77px] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 lg:py-24">
          <nav
            aria-label="On this page"
            className="rounded-[14px] border border-border bg-bg p-6 lg:sticky lg:top-8"
          >
            <p className="text-[13px] font-semibold tracking-[0.1em] text-text-muted uppercase">
              On this page
            </p>
            <ol className="mt-4 space-y-1 border-l-2 border-border">
              {legal.sections.map((section, i) => (
                <li key={i}>
                  <a
                    href={`#section-${i + 1}`}
                    className="-ml-0.5 block border-l-2 border-transparent py-2 pl-4 text-[15px] text-text-muted hover:border-gold hover:text-navy"
                  >
                    {`${i + 1}. ${section.heading}`}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="max-w-[780px]">
            {legal.sections.map((section, i) => (
              <section key={i} id={`section-${i + 1}`} className="scroll-mt-8 pb-10">
                <h2 className="text-[26px]/[1.2] md:text-[30px] lg:text-[34px]">
                  {`${i + 1}. ${section.heading}`}
                </h2>
                <div className="mt-4 space-y-4 text-[17px] text-text-body">
                  {section.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {section.list && (
                    <ul className="space-y-2.5 pl-1">
                      {section.list.map((item, j) => (
                        <li key={j} className="flex items-center gap-3">
                          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-deep" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            <aside className="mt-4 flex flex-col gap-5 rounded-[20px] bg-gold-tint p-7 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-navy">Questions about this page?</p>
                <p className="mt-1 text-[15px] text-text-muted">{legal.questionsLine}</p>
              </div>
              <Link
                href="/contact"
                className="shrink-0 self-start rounded-lg bg-navy px-6 py-3 text-[15px] font-semibold text-white hover:bg-navy-deep md:self-auto"
              >
                Contact us
              </Link>
            </aside>
          </article>
        </div>
      </div>
    </main>
  );
}
