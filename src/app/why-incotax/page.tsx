import type { Metadata } from "next";

import { CheckIcon, contactIcons, Icon } from "@/components/icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { home } from "@/content/home";
import { whyIncotax } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = { title: `Why IncoTax | ${site.name}` };

const section = "page-container py-[53px] md:py-[77px] lg:py-24";

// Why IncoTax (replaces About): hero → About IncoTax → stats band → two founder cards (board card
// style, 4 points each) → courts and areas of law → WhatsApp band (CLAUDE.md §6.2, §11).
export default function WhyIncotaxPage() {
  return (
    <main>
      <PageHero
        size="inner"
        title={whyIncotax.title}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Why IncoTax" }]}
      >
        <p className="mt-5 max-w-3xl text-[17px]/[27px] text-on-navy md:text-[19px]/[30px]">
          {whyIncotax.intro}
        </p>
      </PageHero>

      <section aria-labelledby="about-heading" className="bg-white">
        <div className={`${section} grid gap-8 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <Eyebrow>About</Eyebrow>
            <h2 id="about-heading" className="mt-4 text-[38px]/[1.1] md:text-[44px] lg:text-[52px]">
              About IncoTax
            </h2>
          </div>
          <div className="space-y-4 text-[17px] text-text-body lg:pt-10">
            {whyIncotax.aboutParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Our numbers" className="bg-navy">
        <ul className="page-container grid grid-cols-2 gap-x-6 gap-y-8 py-12 md:grid-cols-4 lg:py-14">
          {home.stats.map((stat, i) => (
            <li key={stat.label} className={i > 0 ? "md:border-l md:border-navy-line md:pl-6" : ""}>
              <p className="font-heading text-[34px] leading-tight font-bold text-gold lg:text-[48px]">
                {stat.value}
              </p>
              <p className="mt-1 text-[15px] text-on-navy">{stat.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="team-heading" className="bg-white">
        <div className={section}>
          <SectionHeader id="team-heading" eyebrow="Team" title="Our Team" />
          <div className="mt-12 space-y-16 lg:space-y-24">
            {whyIncotax.founders.map((founder, i) => (
              <article
                key={founder.name}
                className={`grid items-center gap-10 lg:gap-16 ${
                  i % 2 === 1
                    ? "lg:grid-cols-[1fr_420px] lg:[&>*:first-child]:order-2"
                    : "lg:grid-cols-[420px_1fr]"
                }`}
              >
                <div className="relative mx-auto w-full max-w-[420px] pr-4 pb-4">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 top-4 left-4 rounded-[20px] border-2 border-gold"
                  />
                  {/* Photo slot: placeholder until photos are confirmed (CLAUDE.md §10). */}
                  <div className="relative flex aspect-[4/5] items-center justify-center rounded-[20px] bg-placeholder text-sm text-text-muted">
                    [Professional photo]
                  </div>
                </div>
                <div>
                  <Eyebrow>{`${founder.role} · ${founder.title}`}</Eyebrow>
                  <h3 className="mt-4 text-[38px]/[1.1] md:text-[44px] lg:text-[52px]">
                    {founder.name}
                  </h3>
                  <p className="mt-5 text-[17px] text-text-body">{founder.bio}</p>
                  <ul className="mt-6 grid gap-3 border-t border-border pt-6 text-[15px] text-text-body sm:grid-cols-2">
                    {founder.points.map((point) => (
                      <li key={point} className="flex items-center gap-3">
                        <CheckIcon className="text-sm text-gold-deep" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <WhatsAppButton className="mt-8" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="practice-heading" className="bg-tint">
        <div className={section}>
          <SectionHeader
            id="practice-heading"
            eyebrow="Practice"
            title="Courts and Areas of Law"
            intro={whyIncotax.practiceIntro}
          />
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              ...whyIncotax.courts.map((name) => ({
                name,
                line: whyIncotax.courtLine,
                icon: contactIcons.court,
              })),
              ...whyIncotax.areas.map((name) => ({
                name,
                line: whyIncotax.areaLine,
                icon: contactIcons.law,
              })),
            ].map((card) => (
              <li
                key={card.name}
                className="flex items-start gap-4 rounded-[14px] bg-white p-6 shadow-card"
              >
                <span className="flex size-[52px] shrink-0 items-center justify-center rounded-xl bg-gold-tint text-navy">
                  <Icon icon={card.icon} className="text-xl" />
                </span>
                <div>
                  <p className="text-[17px] font-semibold text-navy">{card.name}</p>
                  <p className="mt-1 text-sm text-text-muted">{card.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <WhatsAppBand />
    </main>
  );
}
