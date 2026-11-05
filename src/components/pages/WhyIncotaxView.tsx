import { CheckIcon, contactIcons, Icon } from "@/components/icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatsList } from "@/components/ui/StatsList";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { whyIncotax } from "@/content/pages";
import type { Nodes } from "@/lib/editable-content";
import type { HomeNodes } from "@/lib/home-content";

const section = "page-container py-[53px] md:py-[77px] lg:py-24";

/** The panel's add controls. With one, its section stays on screen while empty. */
export type WhyIncotaxSlots = {
  about?: React.ReactNode;
  stats?: React.ReactNode;
  founderPoints?: (index: number) => React.ReactNode;
  practice?: React.ReactNode;
};

// Why IncoTax (replaces About): hero → About IncoTax → stats band → two founder cards (board card
// style, 4 points each) → courts and areas of law → WhatsApp band. The public page and the panel
// both draw this.
export function WhyIncotaxView({
  content,
  stats,
  slots = {},
  echo = {},
}: {
  content: Nodes<typeof whyIncotax>;
  stats: HomeNodes["stats"];
  slots?: WhyIncotaxSlots;
  /** One line repeats on every card; the panel edits it on the first and repeats this text. */
  echo?: { courtLine?: string; areaLine?: string };
}) {
  return (
    <>
      <PageHero
        size="inner"
        title={content.title}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Why IncoTax" }]}
      >
        <p className="mt-5 max-w-3xl text-[17px]/[27px] text-on-navy md:text-[19px]/[30px]">
          {content.intro}
        </p>
      </PageHero>

      {(content.aboutParagraphs.length > 0 || slots.about) && (
        <section aria-labelledby="about-heading" className="bg-white">
          <div className={`${section} grid gap-8 lg:grid-cols-2 lg:gap-16`}>
            <div>
              <Eyebrow>About</Eyebrow>
              <h2
                id="about-heading"
                className="mt-4 text-[38px]/[1.1] md:text-[44px] lg:text-[52px]"
              >
                About IncoTax
              </h2>
            </div>
            <div className="space-y-4 text-[17px] text-text-body lg:pt-10">
              {content.aboutParagraphs.map((p, i) => (
                <p key={i} className="relative">
                  {p}
                </p>
              ))}
              {slots.about}
            </div>
          </div>
        </section>
      )}

      {(stats.length > 0 || slots.stats) && (
        <section aria-label="Our numbers" className="bg-navy">
          {stats.length > 0 && (
            <StatsList stats={stats} className="page-container py-12 lg:py-14" />
          )}
          {slots.stats}
        </section>
      )}

      <section aria-labelledby="team-heading" className="bg-white">
        <div className={section}>
          <SectionHeader id="team-heading" eyebrow="Team" title="Our Team" />
          <div className="mt-12 space-y-16 lg:space-y-24">
            {content.founders.map((founder, i) => (
              <article
                key={i}
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
                  {/* Photo slot: placeholder until photos are confirmed. */}
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
                  {founder.points.length > 0 && (
                    <ul className="mt-6 grid gap-3 border-t border-border pt-6 text-[15px] text-text-body sm:grid-cols-2">
                      {founder.points.map((point, j) => (
                        <li key={j} className="relative flex items-center gap-3">
                          <CheckIcon className="text-sm text-gold-deep" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                  {slots.founderPoints?.(i)}
                  <WhatsAppButton className="mt-8" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {(content.courts.length + content.areas.length > 0 || slots.practice) && (
        <section aria-labelledby="practice-heading" className="bg-tint">
          <div className={section}>
            <SectionHeader
              id="practice-heading"
              eyebrow="Practice"
              title="Courts and Areas of Law"
              intro={content.practiceIntro}
            />
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                ...content.courts.map((name, i) => ({
                  name,
                  line: i === 0 ? content.courtLine : (echo.courtLine ?? content.courtLine),
                  icon: contactIcons.court,
                })),
                ...content.areas.map((name, i) => ({
                  name,
                  line: i === 0 ? content.areaLine : (echo.areaLine ?? content.areaLine),
                  icon: contactIcons.law,
                })),
              ].map((card, i) => (
                <li
                  key={i}
                  className="relative flex items-start gap-4 rounded-[14px] bg-white p-6 shadow-card"
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
            {slots.practice}
          </div>
        </section>
      )}

      <WhatsAppBand />
    </>
  );
}
