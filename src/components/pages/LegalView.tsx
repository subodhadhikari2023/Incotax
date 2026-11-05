import Link from "next/link";

import { PageHero } from "@/components/ui/PageHero";

export type LegalSectionNodes = {
  heading: React.ReactNode;
  /** The heading as plain text for the contents list, when `heading` is an editable element. */
  tocLabel?: string;
  paragraphs: React.ReactNode[];
  list?: React.ReactNode[];
};

// One template for the five legal pages. The public page and the panel both draw this.
export function LegalView({
  label,
  legal,
  sectionsAfter,
}: {
  label: string;
  legal: {
    lastUpdated: React.ReactNode;
    questionsLine: React.ReactNode;
    sections: LegalSectionNodes[];
  };
  /** The panel's add control. */
  sectionsAfter?: React.ReactNode;
}) {
  return (
    <>
      <PageHero title={label} breadcrumb={[{ label: "Home", href: "/" }, { label }]}>
        <p className="mt-5 text-[17px] text-on-navy">Last updated: {legal.lastUpdated}</p>
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
                    {i + 1}. {section.tocLabel ?? section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="max-w-[780px]">
            {legal.sections.map((section, i) => (
              <section key={i} id={`section-${i + 1}`} className="relative scroll-mt-8 pb-10">
                <h2 className="text-[26px]/[1.2] md:text-[30px] lg:text-[34px]">
                  {i + 1}. {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-[17px] text-text-body">
                  {section.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {section.list && (
                    <ul className="space-y-2.5 pl-1">
                      {section.list.map((item, j) => (
                        <li key={j} className="relative flex items-center gap-3">
                          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-deep" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
            {sectionsAfter}

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
    </>
  );
}
