import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatsList } from "@/components/ui/StatsList";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { home } from "@/content/home";
import type { HomeContent } from "@/lib/home-content";

import { HeroHeadline } from "./HeroHeadline";

// Navy home hero: label, headline, supporting text, WhatsApp button and up to 4 stats.
export function HeroSection({ content = home }: { content?: HomeContent }) {
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative overflow-hidden bg-navy text-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
        <span className="absolute top-0 -right-48 size-[760px] rounded-full border border-navy-line" />
        <span className="absolute top-0 -right-16 size-[400px] rounded-full border border-navy-line" />
      </div>
      <div className="relative page-container pt-[62px] pb-12 md:pt-[90px] md:pb-14 lg:pt-28 lg:pb-16">
        <Eyebrow onNavy>{content.hero.label}</Eyebrow>
        <HeroHeadline text={content.hero.headline} goldPhrase={content.hero.goldPhrase} />
        <p className="mt-6 max-w-3xl text-[17px]/[27px] text-on-navy md:text-[19px]/[30px]">
          {content.hero.text}
        </p>
        <WhatsAppButton className="mt-9" />

        {content.stats.length > 0 && (
          <StatsList
            stats={content.stats}
            className="mt-14 border-t border-navy-line pt-10 lg:mt-20"
          />
        )}
      </div>
    </section>
  );
}
